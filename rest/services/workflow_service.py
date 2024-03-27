import re
from math import ceil
from aiohttp import ClientSession
import asyncio
from copy import deepcopy
from uuid import uuid4
import io
from datetime import datetime, timezone
from repository.piece_repository import PieceRepository
from schemas.context.auth_context import AuthorizationContextData

from core.logger import get_configured_logger
from core.settings import settings
from pathlib import Path
from utils.workflow_template import workflow_template
from schemas.requests.workflow import CreateWorkflowRequest, ListWorkflowsFilters, WorkflowSharedStorageSourceEnum, storage_default_piece_model_map
from schemas.responses.workflow import (
    CreateWorkflowResponse,
    GetWorkflowsResponse,
    GetWorkflowResponse,
    GetWorkflowsResponseData,
    GetWorkflowRunsResponse,
    GetWorkflowRunsResponseData,
    GetWorkflowRunTasksResponseData,
    GetWorkflowRunTasksResponse,
    GetWorkflowResultReportResponse,
    GetWorkflowRunTaskLogsResponse,
    GetWorkflowRunTaskResultResponse,
    WorkflowStatus
)
from schemas.responses.base import PaginationSet
from schemas.exceptions.base import ConflictException, ForbiddenException, ResourceNotFoundException, BadRequestException
from repository.workflow_repository import WorkflowRepository
from clients.airflow_client import AirflowRestClient
from clients.local_files_client import LocalFilesClient
from clients.github_rest_client import GithubRestClient
from database.models import Workflow, WorkflowPieceRepositoryAssociative
from repository.piece_repository_repository import PieceRepositoryRepository
from repository.workflow_repository import WorkflowRepository
from repository.secret_repository import SecretRepository
from services.secret_service import SecretService


class WorkflowService(object):
    def __init__(self) -> None:
        # Clients
        self.file_system_client = LocalFilesClient()
        self.github_rest_client = GithubRestClient(token=settings.DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS)
        self.airflow_client = AirflowRestClient()

        # Service
        self.secret_service = SecretService()

        # Repositories
        self.workflow_repository = WorkflowRepository()
        self.piece_repository_repository = PieceRepositoryRepository()
        self.piece_repository = PieceRepository()
        self.secret_repository = SecretRepository()

        # Configs
        self.logger = get_configured_logger(self.__class__.__name__)

    def create_workflow(
        self,
        workspace_id: int,
        body: CreateWorkflowRequest,
        auth_context: AuthorizationContextData
    ) -> CreateWorkflowResponse:
        # If workflow with this name already exists for the group raise conflict
        workflow = self.workflow_repository.find_by_name_and_workspace_id(
            body.workflow.name,
            workspace_id=workspace_id
        )
        if workflow:
            raise ConflictException("Workflow with this name already exists")

        workflow_id = str(uuid4()).replace('-', '')
        new_workflow = Workflow(
            name=body.workflow.name,
            uuid_name=workflow_id,
            created_at=datetime.utcnow(),
            schema=body.forageSchema,
            ui_schema=body.ui_schema.model_dump(),
            created_by=auth_context.user_id,
            last_changed_at=datetime.utcnow(),
            start_date=body.workflow.start_date,
            end_date=body.workflow.end_date,
            schedule=body.workflow.schedule,
            last_changed_by=auth_context.user_id,
            workspace_id=workspace_id
        )
        workflow = self.workflow_repository.create(new_workflow)

        data_dict = body.model_dump()
        data_dict['workflow']['id'] = workflow_id

        try:
            self._validate_workflow_tasks(tasks_dict=data_dict.get('tasks'), workspace_id=workspace_id)

            _, workflow_code, pieces_repositories_ids = self._create_dag_code_from_raw_json(data_dict, workspace_id=workspace_id)

            workflow_piece_repository_associations = [
                WorkflowPieceRepositoryAssociative(
                    workflow_id=workflow.id,
                    piece_repository_id=piece_repository_id
                )
                for piece_repository_id in pieces_repositories_ids
            ]
            self.workflow_repository.create_workflow_piece_repositories_associations(
                workflow_piece_repository_associative=workflow_piece_repository_associations
            )

            # TODO use local fs for local-k8s-dev ?
            if settings.DEPLOY_MODE == 'local-compose':
                workflow_path = Path(settings.DOMINO_LOCAL_WORKFLOWS_REPOSITORY) / f'{workflow_id}.py'
                self.file_system_client.save_file(
                    path=str(workflow_path),
                    content=workflow_code
                )
            else:
                workflow_path_git = f'workflows/{workflow_id}.py'
                self.github_rest_client.create_file(
                    repo_name=settings.DOMINO_GITHUB_WORKFLOWS_REPOSITORY,
                    file_path=workflow_path_git,
                    content=workflow_code
                )

            workflow = self.workflow_repository.update(workflow)
            response = CreateWorkflowResponse(
                id=workflow.id,
                name=workflow.name,
                created_at=workflow.created_at,
                schema=workflow.schema,
                created_by=workflow.created_by,
                last_changed_at=workflow.last_changed_at,
                last_changed_by=workflow.last_changed_by,
            )
            return response
        except (BaseException, ConflictException, ForbiddenException, ResourceNotFoundException) as custom_exception:
            asyncio.run(self.delete_workflow(workflow_id=workflow.id, workspace_id=workspace_id))
            raise custom_exception

    async def get_airflow_dags_by_id_gather_chunk(self, dag_ids):
        """
        Creates a session, create run_program list by each dag_id and call asyncio gather
        """
        async with ClientSession() as session:
            res = await asyncio.gather(*[self.airflow_client.get_dag_by_id_async(session, dag_id) for dag_id in dag_ids])
        return res

    async def list_workflows(
        self,
        workspace_id: int,
        page: int,
        page_size: int,
        filters: ListWorkflowsFilters,
    ):
        workflows = self.workflow_repository.find_by_workspace_id(
            workspace_id=workspace_id,
            page=page,
            page_size=page_size,
            filters=filters.model_dump(exclude_none=True),
            descending=True
        )

        workflow_uuid_map = {
            workflow.uuid_name: workflow
            for workflow, _ in workflows
        }

        # TODO - Create chunks of N dag_ids if necessary
        airflow_dags_responses = await self.get_airflow_dags_by_id_gather_chunk(list(workflow_uuid_map.keys()))

        max_total_errors_limit = 100
        import_errors_response = self.airflow_client.list_import_errors(limit=max_total_errors_limit)
        if import_errors_response.status_code != 200:
            raise BaseException("Error when trying to fetch import errors from airflow webserver.")

        import_errors_response_content = import_errors_response.json()
        if import_errors_response_content['total_entries'] >= max_total_errors_limit:
            # TODO handle to many import errors
            raise BaseException("To many import errors in airflow webserver.")

        import_errors_uuids = [e.get('filename').split('dags/')[1].split('.py')[0] for e in import_errors_response_content['import_errors']]

        # Add more info to model if necessary
        data = []
        for dag_info in airflow_dags_responses:
            dag_uuid = dag_info['dag_id']
            dag_data = workflow_uuid_map[dag_uuid]
            response = dag_info['response']

            is_dag_broken = dag_uuid in import_errors_uuids

            schedule = 'none'
            is_active = False
            is_paused = False
            next_dagrun = None
            status = WorkflowStatus.creating.value
            if is_dag_broken:
                status = WorkflowStatus.failed.value
                schedule = 'failed'
                is_active = False
                is_paused = False

            if response and not is_dag_broken:
                schedule = dag_data.schedule.value
                if schedule != 'none':
                    schedule = f"@{schedule}"
                status = WorkflowStatus.active.value

                is_paused = response.get("is_paused")
                is_active = response.get("is_active")
                next_dagrun = response.get("next_dagrun_data_interval_end")

            data.append(
                GetWorkflowsResponseData(
                    id=dag_data.id,
                    name=dag_data.name,
                    created_at=dag_data.created_at,
                    start_date=dag_data.start_date,
                    end_date=dag_data.end_date,
                    last_changed_at=dag_data.last_changed_at,
                    last_changed_by=dag_data.last_changed_by,
                    created_by=dag_data.created_by,
                    workspace_id=dag_data.workspace_id,
                    is_paused=is_paused,
                    is_active=is_active,
                    status=status,
                    schedule=schedule,
                    next_dagrun=next_dagrun
                )
            )

        count = 0 if not workflows else workflows[0].count
        pagination_metadata = PaginationSet(
            page=page,
            records=len(data),
            total=count,
            last_page=max(0, ceil(count / page_size) - 1)
        )

        response = GetWorkflowsResponse(
            data=data,
            metadata=pagination_metadata
        )

        return response

    def get_workflow(self, workspace_id: int, workflow_id: str, auth_context: AuthorizationContextData) -> GetWorkflowResponse:
        workflow = self.workflow_repository.find_by_id(id=workflow_id)
        if not workflow:
            raise ResourceNotFoundException()

        if workflow.workspace_id != workspace_id:
            raise ForbiddenException()

        airflow_dag_info = self.airflow_client.get_dag_by_id(dag_id=workflow.uuid_name)

        if airflow_dag_info.status_code == 404:
            airflow_dag_info = {
                'is_paused': 'creating',
                'is_active': 'creating',
                'is_subdag': 'creating',
                'last_pickled': 'creating',
                'last_expired': 'creating',
                'schedule': 'creating',
                'max_active_tasks': 'creating',
                'max_active_runs': 'creating',
                'has_task_concurrency_limits': 'creating',
                'has_import_errors': 'creating',
                'next_dagrun': 'creating',
                'next_dagrun_data_interval_start': 'creating',
                'next_dagrun_data_interval_end': 'creating',
            }
        else:
            airflow_dag_info = airflow_dag_info.json()

        # Airflow 2.4.0 deprecated schedule_interval in dag but the API (2.7.2) still using it
        schedule = airflow_dag_info.pop("schedule_interval")
        if isinstance(schedule, dict):
            schedule = schedule.get("value")

        response = GetWorkflowResponse(
            id=workflow.id,
            name=workflow.name,
            schema=workflow.schema,
            ui_schema=workflow.ui_schema,
            created_at=workflow.created_at,
            last_changed_at=workflow.last_changed_at,
            last_changed_by=workflow.last_changed_by,
            created_by=workflow.created_by,
            workspace_id=workflow.workspace_id,
            schedule=schedule,
            **airflow_dag_info
        )

        return response


    def check_existing_workflow(self):
        pass

    def _validate_workflow_tasks(self, tasks_dict: dict, workspace_id: int):
        # get all repositories ids necessary for tasks
        # get all workspaces ids necessary for repositories referenced by tasks
        # check if user has access to all necessary workspaces
        pieces_names = set()
        pieces_source_images = set()
        shared_storage_sources = []
        for v in tasks_dict.values():
            pieces_names.add(v['piece']['name'])
            pieces_source_images.add(v['piece']['source_image'])
            shared_storage_sources.append(v['workflow_shared_storage']['source'])

        shared_storage_source = list(set(shared_storage_sources))
        if len(shared_storage_source) > 1:
            raise BadRequestException("Workflow can't have more than one shared storage source.")

        shared_storage_source = shared_storage_source[0]
        shared_storage_source = WorkflowSharedStorageSourceEnum(shared_storage_source).name
        shared_storage_model = storage_default_piece_model_map.get(shared_storage_source, None)
        if shared_storage_model:
            shared_storage_piece_name = shared_storage_model().name

        shared_storage_repository = self._get_storage_repository_from_tasks(
            tasks=tasks_dict,
            workspace_id=workspace_id,
        )
        if shared_storage_repository:
            # validate if all secrets are filled for the shared storage piece used
            shared_storage_secrets = self.secret_service.get_piece_secrets(
                piece_repository_id=shared_storage_repository.id,
                piece_name=shared_storage_piece_name,
            )
            for secret in shared_storage_secrets:
                if not secret.value and not secret.required:
                    raise BadRequestException("Missing secrets for shared storage.")

        # Find necessary repositories from pieces names and workspace_id
        necessary_repositories_and_pieces = self.piece_repository.find_repositories_by_piece_name_and_workspace_id(
            pieces_names=pieces_names,
            sources_images=pieces_source_images,
            workspace_id=workspace_id
        )

        if len(necessary_repositories_and_pieces) != len(pieces_names):
            raise ResourceNotFoundException("Some pieces were not found for this workspace.")

        for repo_piece in necessary_repositories_and_pieces:
            piece_name = repo_piece.piece_name
            piece_secrets = self.secret_service.get_piece_secrets(
                piece_repository_id=repo_piece.piece_repository_id,
                piece_name=piece_name,
            )
            for secret in piece_secrets:
                if not secret.value and secret.required:
                    raise ResourceNotFoundException(f"Secret {secret.name} missing for {piece_name}.")
        return True

    def _get_storage_repository_from_tasks(self, tasks: list, workspace_id: int):
        if not tasks:
            return None

        usage_task = tasks[list(tasks.keys())[0]]
        workflow_shared_storage = usage_task.get('workflow_shared_storage', None)

        shared_source = WorkflowSharedStorageSourceEnum(workflow_shared_storage['source']).name
        shared_model = storage_default_piece_model_map.get(shared_source, None)

        if not shared_model:
            return None

        filters = {
            'source': 'default',
            'name__like': 'default_storage_repository'
        }
        workspace_storage_repository = self.piece_repository_repository.find_by_workspace_id(workspace_id=workspace_id, page=0, page_size=100, filters=filters)
        if not workspace_storage_repository:
            raise ResourceNotFoundException("Default storage repository not found for this workspace.")

        workspace_storage_repository = workspace_storage_repository[0][0]
        return workspace_storage_repository

    def _create_dag_code_from_raw_json(self, data: dict, workspace_id: int):
        """
        Creates dag code from workflow request json

        Args:
            data (dict): Workflow request json

        Returns:
            workflow_processed_schema (dit): processed workflow schema.
            py_code (str): python code as string buffer for dag.
        """
        tasks = data.get('tasks')
        workflow_kwargs = data.get('workflow')
        """
        Format workflow kwargs to the formmate required by airflow. It should contain only the following kwargs:
        - dag_id
        - schedule
        - start_date
        - end_date (not none)
        """
        workflow_kwargs['dag_id'] = workflow_kwargs.pop('id')
        select_end_date = workflow_kwargs.pop('select_end_date') # TODO define how to use select end date
        workflow_kwargs.pop('select_start_date')
        workflow_kwargs['schedule'] = None if workflow_kwargs['schedule'] == 'none' else f"@{workflow_kwargs['schedule']}"

        workflow_processed_schema = {
            'workflow': deepcopy(workflow_kwargs),
        }
        workflow_processed_schema['workflow'].pop('dag_id')

        if 'end_date' in workflow_kwargs and not workflow_kwargs['end_date']:
            workflow_kwargs.pop('end_date')

        # TODO define how to use generate report
        remove_from_dag_kwargs = ['name', 'workspace_id', 'generate_report', 'description', 'id']
        for key in remove_from_dag_kwargs:
            if key in workflow_kwargs:
                workflow_kwargs.pop(key)

        pieces_repositories_ids = set()
        stream_tasks_dict = dict()
        for task_key, task_value in tasks.items():
            piece_request = task_value.get('piece')
            raw_input_kwargs = task_value.get('piece_input_kwargs', {})
            workflow_shared_storage = task_value.get('workflow_shared_storage', None)
            container_resources = task_value.get('container_resources', None)

            if container_resources:
                container_resources['requests']['cpu'] = f'{container_resources["requests"]["cpu"]}m'
                container_resources['requests']['memory'] = f'{container_resources["requests"]["memory"]}Mi'
                container_resources['limits']['cpu'] = f'{container_resources["limits"]["cpu"]}m'
                container_resources['limits']['memory'] = f'{container_resources["limits"]["memory"]}Mi'

            input_kwargs = {}
            for input_key, input_value in raw_input_kwargs.items():
                if input_value['fromUpstream']:
                    input_kwargs[input_key] = {}
                    input_kwargs[input_key]['type'] = 'fromUpstream'
                    input_kwargs[input_key]['upstream_task_id'] = input_value['upstreamTaskId']
                    input_kwargs[input_key]['output_arg'] = input_value['upstreamArgument']
                elif isinstance(input_value['value'], list):
                    array_input_kwargs = []
                    for element_idx, element in enumerate(input_value['value']):
                        element_from_upstream = element['fromUpstream']
                        # simple array
                        # TODO we must handle fromUpstream at item level in Task domino class
                        if isinstance(element_from_upstream, bool):
                            if element_from_upstream:
                                array_input_kwargs.append({
                                    'type': 'fromUpstream',
                                    'upstream_task_id': element['upstreamTaskId'],
                                    'output_arg': element['upstreamArgument'],
                                })
                                continue
                            array_input_kwargs.append(element['value'])

                        # TODO composite array
                        elif isinstance(element_from_upstream, dict):
                            value_dict = {}
                            for _key, from_upstream in element_from_upstream.items():
                                if from_upstream:
                                    value_dict[_key] = {
                                        'type': 'fromUpstream',
                                        'upstream_task_id': element['upstreamTaskId'][_key],
                                        'output_arg': element['upstreamArgument'][_key],
                                    }
                                else:
                                    value_dict[_key] = element['value'][_key]
                            array_input_kwargs.append(value_dict)
                    input_kwargs[input_key] = array_input_kwargs
                else:
                    input_kwargs[input_key] = input_value['value']


            # piece_request = {"id": 1, "name": "SimpleLogPiece"}
            piece_db = self.piece_repository.find_repository_by_piece_name_and_workspace_id(
                workspace_id=workspace_id,
                piece_name=piece_request['name']
            )
            pieces_repositories_ids.add(piece_db.piece_repository_id)
            stream_tasks_dict[task_key] = {
                'task_id': task_key,
                'workspace_id': workspace_id,
                'piece': {
                    'name': piece_db.piece_name,
                    'source_image': piece_db.source_image,
                    'repository_url': piece_db.piece_repository_url,
                    'repository_version': piece_db.piece_repository_version,
                },
                'input_kwargs': input_kwargs,
                'workflow_shared_storage': workflow_shared_storage,
                'container_resources': container_resources,
            }
            if 'dependencies' in task_value and task_value['dependencies']:
                stream_tasks_dict[task_key]['upstream'] = task_value.get('dependencies')

        stream = workflow_template.stream(
            workflow_kwargs=workflow_kwargs,
            tasks_dict=stream_tasks_dict
        )
        workflow_processed_schema['tasks'] = stream_tasks_dict
        io_obj = io.StringIO()
        stream.dump(io_obj)
        py_code = io_obj.getvalue()

        return workflow_processed_schema, py_code, pieces_repositories_ids

    def get_all_pieces_from_tasks_dict(self, tasks_dict):
        all_pieces = list()
        for k, v in tasks_dict.items():
            all_pieces.append(v["piece"])
        return list(dict.fromkeys(all_pieces))

    def run_workflow(self, workflow_id: int):
        workflow = self.workflow_repository.find_by_id(id=workflow_id)
        if not workflow:
            raise ResourceNotFoundException("Workflow not found")

        # Check if start date is in the past
        if workflow.start_date and workflow.start_date > datetime.now(tz=timezone.utc):
            raise ForbiddenException('Workflow start date is in the future. Can not run it now.')

        if workflow.end_date and workflow.end_date < datetime.now(tz=timezone.utc):
            raise ForbiddenException('You cannot run workflows that have ended.')

        airflow_workflow_id = workflow.uuid_name

        # Force unpause workflow
        payload = {
            "is_paused": False
        }
        update_response = self.airflow_client.update_dag(
            dag_id=airflow_workflow_id,
            payload=payload
        )
        if update_response.status_code == 404:
            raise ConflictException("Workflow still in creation process.")

        if update_response.status_code != 200:
            self.logger.error(f"Error while trying to unpause workflow {workflow_id}")
            self.logger.error(update_response.json())
            raise BaseException("Error while trying to run workflow")

        run_dag_response = self.airflow_client.run_dag(dag_id=airflow_workflow_id)
        if run_dag_response.status_code != 200:
            self.logger.error(f"Error while trying to run workflow {workflow_id}")
            self.logger.error(run_dag_response.json())
            raise BaseException("Error while trying to run workflow")

    async def delete_workspace_workflows(self, workspace_id: int):
        # TODO: improve this? Maybe running in a worker and not in the main thread? Pagination may take a while if there are a lot of workflows.
        workflows = self.workflow_repository.find_by_workspace_id(workspace_id=workspace_id, paginate=False, count=False)

        await asyncio.gather(*[self.delete_workflow_files(workflow_uuid=workflow.uuid_name) for workflow in workflows])
        self.workflow_repository.delete_by_workspace_id(workspace_id=workspace_id)

    async def delete_workflow_files(self, workflow_uuid):
        if settings.DEPLOY_MODE == 'local-compose':
            self.file_system_client.delete_file(
                path=f"{settings.DOMINO_LOCAL_WORKFLOWS_REPOSITORY}/{workflow_uuid}.py"
            )
            return

        self.github_rest_client.delete_file(
            repo_name=settings.DOMINO_GITHUB_WORKFLOWS_REPOSITORY,
            file_path=f"workflows/{workflow_uuid}.py"
        )

    async def delete_workflow(self, workflow_id: str, workspace_id: int):
        workflow = self.workflow_repository.find_by_id(id=workflow_id)
        if not workflow:
            raise ResourceNotFoundException("Workflow not found!")
        if workflow.workspace_id != workspace_id:
            raise ForbiddenException("Workflow does not belong to workspace!")
        try:
            await self.delete_workflow_files(workflow_uuid=workflow.uuid_name)
            self.airflow_client.delete_dag(dag_id=workflow.uuid_name)
            self.workflow_repository.delete(id=workflow_id)
        except Exception as e: # TODO improve exception handling
            self.logger.exception(e)
            self.workflow_repository.delete(id=workflow_id)
            raise e

    def workflow_details(self, workflow_id: str):
        try:
            all_tasks_response = self.airflow_client.get_all_workflow_tasks(workflow_id=workflow_id).json()
            all_workflow_runs = self.airflow_client.get_all_workflow_runs(workflow_id=workflow_id).json()

            response_payload = {
                "n_tasks": all_tasks_response["total_entries"],
                "n_runs": all_workflow_runs["total_entries"],
                "executions": [{
                    "execution_date": e["execution_date"],
                    "state": e["state"],
                    "elapsed_time": "" if e['end_date'] is None else str(datetime.fromisoformat(e['end_date']) - datetime.fromisoformat(e['start_date']))
                } for e in all_workflow_runs['workflow_runs']]
            }
            return response_payload
        except Exception as e:
            self.logger.exception(e)
            raise e

    def list_workflow_runs(self, workflow_id: int, page: int, page_size: int):
        workflow = self.workflow_repository.find_by_id(id=workflow_id)
        if not workflow:
            raise ResourceNotFoundException("Workflow not found")

        airflow_workflow_id = workflow.uuid_name

        response = self.airflow_client.get_all_workflow_runs(
            dag_id=airflow_workflow_id,
            page=page,
            page_size=page_size,
            descending=True
        )
        response_data = response.json()
        if not response_data:
            response = GetWorkflowRunsResponse(
                data=[],
                metadata=dict(
                    page=page,
                    records=0,
                    total=0,
                    last_page=0,
                )
            )
            return response

        records = len(response_data['dag_runs'])
        total = response_data['total_entries']
        last_page = ceil(total / page_size) - 1

        # Airflow API returns always the same number of elements defined by page size.
        # So if we are in the last page we need to remove the extra elements.
        # Example: total = 12, page_size = 10, last_page = 1.
        # Airflow api will return the first 10 elements in page 0 and the last 10 elements in page 1.
        # We want to return only the last 2 elements in page 1.
        if page == last_page:
            records = total - (page * page_size)
            dag_runs = response_data['dag_runs'][-records:]
        else:
            dag_runs = response_data['dag_runs']

        data = []
        for run in dag_runs:
            if run.get('end_date') is None or run.get('start_date') is None:
                run['duration_in_seconds'] = None
                data.append(
                    GetWorkflowRunsResponseData(**run)
                )
                continue
            end_date_dt = datetime.fromisoformat(run.get('end_date'))
            start_date_dt = datetime.fromisoformat(run.get('start_date'))
            duration = end_date_dt - start_date_dt
            run['duration_in_seconds'] = duration.total_seconds()
            data.append(
                GetWorkflowRunsResponseData(**run)
            )

        response = GetWorkflowRunsResponse(
            data=data,
            metadata=dict(
                page=page,
                records=records,
                total=total,
                last_page=max(0, last_page),
            )
        )
        return response

    def list_run_tasks(self, workflow_id: int, workflow_run_id: str, page: int, page_size: int):
        workflow = self.workflow_repository.find_by_id(id=workflow_id)
        if not workflow:
            raise ResourceNotFoundException("Workflow not found")

        airflow_workflow_id = workflow.uuid_name

        response = self.airflow_client.get_all_run_tasks_instances(
            dag_id=airflow_workflow_id,
            dag_run_id=workflow_run_id,
            page=page,
            page_size=page_size
        )
        response_data = response.json()
        if not response_data:
            response = GetWorkflowRunsResponse(
                data=[],
                metadata=dict(
                    page=page,
                    records=0,
                    total=0,
                    last_page=0,
                )
            )
            return response

        records = len(response_data['task_instances'])
        total = response_data['total_entries']
        last_page = ceil(total / page_size) - 1
        data = [
            GetWorkflowRunTasksResponseData(
                **task_instance,
                docker_image=task_instance.get('rendered_fields').get('image'),
            ) for task_instance in response_data['task_instances']
        ]
        response = GetWorkflowRunTasksResponse(
            data=data,
            metadata=dict(
                page=page,
                records=records,
                total=total,
                last_page=last_page,
            )
        )
        return response

    def generate_report(self, workflow_id: int, workflow_run_id: str):
        page_size = 100
        page=0
        workflow = self.workflow_repository.find_by_id(id=workflow_id)
        if not workflow:
            raise ResourceNotFoundException("Workflow not found")

        airflow_workflow_id = workflow.uuid_name

        response = self.airflow_client.get_all_run_tasks_instances(
            dag_id=airflow_workflow_id,
            dag_run_id=workflow_run_id,
            page=page,
            page_size=page_size
        )

        response_data = response.json()

        if not response_data:
            return []

        total_tasks = response_data.get("total_entries")
        all_run_tasks = response_data["task_instances"]

        while len(all_run_tasks) < total_tasks:
            page+=1
            response = self.airflow_client.get_all_run_tasks_instances(
                dag_id=airflow_workflow_id,
                dag_run_id=workflow_run_id,
                page=page,
                page_size=page_size
            )
            all_run_tasks.extend(response.json().get("task_instances"))

        sorted_all_run_tasks = sorted(all_run_tasks, key=lambda item: datetime.strptime(item["end_date"], "%Y-%m-%dT%H:%M:%S.%f%z"))

        result_list = []

        for task in sorted_all_run_tasks:
            try:
                task_result = self.airflow_client.get_task_result(
                    dag_id=airflow_workflow_id,
                    dag_run_id=workflow_run_id,
                    task_id=task["task_id"],
                    task_try_number=task["try_number"]
                )

                node = workflow.ui_schema.get("nodes", {}).get(task["task_id"], {})
                piece_name = node.get("data", {}).get("style", {}).get("label", None) or \
                            node.get("data", {}).get("name", None)

                result_list.append(
                    dict(
                        base64_content=task_result.get("base64_content"),
                        file_type=task_result.get("file_type"),
                        piece_name=piece_name,
                        dag_id=task.get("dag_id"),
                        duration=task.get("duration"),
                        start_date=task.get("start_date"),
                        end_date=task.get("end_date"),
                        execution_date=task.get("execution_date"),
                        task_id=task.get("task_id"),
                        state=task.get("state"),
                    )
                )
            except BaseException as e:
                # Handle the exception as needed
                self.logger.info(f"Skipping task {task['task_id']} due to exception: {e}")

        return GetWorkflowResultReportResponse(data=result_list)

    @staticmethod
    def parse_log(log_text: str):
        # Get the log lines between the start and stop patterns
        start_command_pattern = "Start cut point for logger 48c94577-0225-4c3f-87c0-8add3f4e6d4b"
        stop_command_pattern = "End cut point for logger 48c94577-0225-4c3f-87c0-8add3f4e6d4b"
        # Find all lines between the start and stop patterns
        # We are using re.DOTALL to match newlines
        log = re.findall(f"[^\n]*{start_command_pattern}.*?{stop_command_pattern}[^\n]*", log_text, re.DOTALL)
        # If the log is empty probably it is still running so we can parse all logs from the start pattern
        if not log:
            log = re.findall(f"[^\n]*{start_command_pattern}.*", log_text, re.DOTALL)

        if not log:
            return []

        # Parse the log lines
        output_lines = []
        for line in log[0].split('\n')[:-1]:
            # Remove pod manager info it exists
            l = re.sub(r"{pod_manager.py:[0-9]*}", '', line)
            # Get datetime pattern
            datetime_pattern = r'\[*\d{4}[-/]\d{2}[-/]\d{2} \d{2}:\d{2}:\d{2}(,|.)\d+\]*'
            # Remove duplicated datetimes if they exist (they are added by the airflow logger and the domino so in some cases we have 2 datetimes in one line)
            matches = list(re.finditer(datetime_pattern, l))
            if len(matches) > 1:
                l = re.sub(datetime_pattern, '', l, len(matches) -1)

            # Remove the start and stop patterns
            if stop_command_pattern in l or start_command_pattern in l:
                continue
            # Strip all extra spaces
            l = " ".join(l.split())

            from_datetime_pattern = r'(\[*\d{4}[-/]\d{2}[-/]\d{2} \d{2}:\d{2}:\d{2}(,|.)\d+\]*)(.*)'
            if re.search(from_datetime_pattern, l) is not None:
                l = re.search(from_datetime_pattern, l).group()

            # Remove all brackets from datetime - workaround by now
            datetime_brackets = r'\[\d{4}[-/]\d{2}[-/]\d{2} \d{2}:\d{2}:\d{2}(,|.)\d*]'
            regex = re.compile(datetime_brackets)
            l = regex.sub(lambda m: '{0}'.format(m.group(0).replace('[','').replace(']', '')), l)

            # Add brackets to datetime
            datetime_no_brackets_pattern = r'\d{4}[-/]\d{2}[-/]\d{2} \d{2}:\d{2}:\d{2}(,|.)\d*'
            regex = re.compile(datetime_no_brackets_pattern)
            l = regex.sub(lambda m: '[{0}]'.format(m.group(0)), l)

            domino_header_pattern = r'(\[*\d{4}[-/]\d{2}[-/]\d{2} \d{2}:\d{2}:\d{2}(,|.)\d+\]*\s(WARNING|INFO|DEBUG|CRITICAL|EXCEPTION)\s---\s\[ MainThread\]\s%s\s:\s\d*\s:)' % start_command_pattern
            header_match = re.match(domino_header_pattern, l)
            if header_match is None:
                # Is content, get all values after the airflow header
                airflow_header_pattern = r'(\[*\d{4}[-/]\d{2}[-/]\d{2} \d{2}:\d{2}:\d{2}(,|.)\d+\]*\s(WARNING|INFO|DEBUG|CRITICAL|EXCEPTION)\s-)'
                l = re.sub(airflow_header_pattern, '', l)
                l = l.strip()
                if l:
                    output_lines.append(l)
                continue

            # Is header, get the header and the values for the domino header and the content
            header_value = header_match.group()
            content_value = l.replace(header_value, '')
            content_value = content_value.strip()
            header_value = header_value.strip()
            output_lines.append(header_value)
            if content_value:
                output_lines.append(content_value)

        return output_lines

    def get_task_logs(self, workflow_id=int, workflow_run_id=str, task_id=str, task_try_number=int):
        workflow = self.workflow_repository.find_by_id(id=workflow_id)
        if not workflow:
            raise ResourceNotFoundException("Workflow not found")

        airflow_workflow_id = workflow.uuid_name
        response = self.airflow_client.get_task_logs(
            dag_id=airflow_workflow_id,
            dag_run_id=workflow_run_id,
            task_id=task_id,
            task_try_number=task_try_number
        )
        if response.status_code != 200:
            raise BaseException("Error while trying to get task logs")

        parsed_log = self.parse_log(
            response.text
        )

        return GetWorkflowRunTaskLogsResponse(
            data=parsed_log
        )

    def get_task_result(self, workflow_id=int, workflow_run_id=str, task_id=str, task_try_number=int):
        workflow = self.workflow_repository.find_by_id(id=workflow_id)
        if not workflow:
            raise ResourceNotFoundException("Workflow not found")
        airflow_workflow_id = workflow.uuid_name
        result_dict = self.airflow_client.get_task_result(
            dag_id=airflow_workflow_id,
            dag_run_id=workflow_run_id,
            task_id=task_id,
            task_try_number=task_try_number
        )
        return GetWorkflowRunTaskResultResponse(**result_dict)