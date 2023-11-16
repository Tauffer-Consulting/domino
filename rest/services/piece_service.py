from typing import List
import json
from schemas.requests.piece import ListPiecesFilters
from schemas.requests.workflow import CreateWorkflowRequest, ListWorkflowsFilters, WorkflowSharedStorageSourceEnum, storage_default_piece_model_map
from schemas.exceptions.base import ResourceNotFoundException,ConflictException, ForbiddenException, BadRequestException
from clients.github_rest_client import GithubRestClient

from core.logger import get_configured_logger
from core.settings import settings
from pathlib import Path
import asyncio
import io
from repository.user_repository import UserRepository
from repository.workspace_repository import WorkspaceRepository
from repository.piece_repository_repository import PieceRepositoryRepository
from database.models import Piece, PieceRepository as PieceRepositoryModel
from database.models.enums import RepositorySource
from clients.local_files_client import LocalFilesClient
from repository.piece_repository import PieceRepository
from schemas.responses.piece import GetPiecesResponse
from utils.base_node_style import get_frontend_node_style
from constants.default_pieces.storage import DEFAULT_STORAGE_PIECES
from datetime import datetime
from utils.workflow_template import workflow_template
from copy import deepcopy
from repository.workflow_repository import WorkflowRepository
from services.secret_service import SecretService


class PieceService(object):
    def __init__(self) -> None:
        self.logger = get_configured_logger(self.__class__.__name__)
        self.piece_repository = PieceRepository()
        self.piece_repository_repository = PieceRepositoryRepository()
        self.workspace_repository = WorkspaceRepository()
        self.user_repository = UserRepository()
        self.file_system_client = LocalFilesClient()
        self.workflow_repository = WorkflowRepository()
        # Service
        self.secret_service = SecretService()

    def create_piece(
        self,
        workspace_id: int,
        body: dict
    ) -> GetPiecesResponse:

        piece = body.piece
        data_dict = body.model_dump()
        data_dict['workflow']['id'] = piece.name
        piece_repository = self.piece_repository_repository.find_by_name(name=piece.repository_name)
        if not piece_repository:
            #create piece repository
            print("creating piece repository",PieceRepository)
            piece_repository = PieceRepositoryModel(
                name=piece.repository_name,
                created_at=datetime.utcnow(),
                workspace_id=workspace_id,
            )
            piece_repository = self.piece_repository_repository.create(piece_repository)
        
        # If workflow with this name already exists for the group raise conflict
        workflow = self.workflow_repository.find_by_name_and_workspace_id(
            body.workflow.name, 
            workspace_id=workspace_id
        )
        if workflow:
            raise ConflictException("Workflow with this name already exists")
        
        try:
            self._validate_workflow_tasks(tasks_dict=data_dict.get('tasks'), workspace_id=workspace_id)

            _, workflow_code, pieces_repositories_ids = self._create_dag_code_from_raw_json(data_dict, workspace_id=workspace_id)

            # TODO: Use local filesystem for local-k8s-dev?
            if settings.DEPLOY_MODE == 'local-compose':
                workflow_path = Path(settings.DOMINO_LOCAL_WORKFLOWS_REPOSITORY) / f'{piece.name}.py'
                self.file_system_client.save_file(
                    path=str(workflow_path),
                    content=workflow_code
                )
            else:
                workflow_path_git = f'workflows/{piece.name}.py'
                self.github_rest_client.create_file(
                    repo_name=settings.DOMINO_GITHUB_WORKFLOWS_REPOSITORY,
                    file_path=workflow_path_git,
                    content=workflow_code
                )

            piece = Piece(
                name=piece.name,
                description=piece.description,
                dependency=piece.dependency,
                source_image=piece.source_image,
                input_schema=piece.input_schema,
                output_schema=piece.output_schema,
                secrets_schema=piece.secrets_schema,
                style=piece.style,
                source_url=piece.source_url,
                repository_id=self.piece_repository_repository.find_by_name(name=piece.repository_name).id
            )
            piece = self.piece_repository.create(piece)

            return GetPiecesResponse(**piece.to_dict())

        except (BaseException, ConflictException, ForbiddenException, ResourceNotFoundException) as custom_exception:
            self.logger.error(f"Error creating workflow: {custom_exception}")
            raise custom_exception


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
                if not secret.value:
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
                if not secret.value:
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




    def list_pieces(
        self,
        piece_repository_id: int,
        page: int,
        page_size: int,
        filters: ListPiecesFilters
    ) -> List[GetPiecesResponse]:
        """List all pieces for all repositories of a workspace

        Args:
            workspace_id (int): Workspace id
            piece_repository_id (int): Piece repository id
            page (int): Page number
            page_size (int): page_size per page - max 50
            auth_context (AuthorizationContextData): User authorization context data

        Returns:
            List[GetPiecesResponse]: List of all pieces data
        """
        
        piece_repository = self.piece_repository_repository.find_by_id(id=piece_repository_id)
        if not piece_repository:
            raise ResourceNotFoundException(message="Workspace or Piece Repository not found")

        pieces = self.piece_repository.find_by_repository_id(
            repository_id=piece_repository_id,
            page=page,
            page_size=page_size,
            filters=filters.dict(exclude_none=True),
        )
        return [
            GetPiecesResponse(**piece.to_dict()) for piece in pieces
        ]


    def check_pieces_to_update_github(
        self, 
        repository_id: int, 
        compiled_metadata: dict,
        dependencies_map: dict,
    ) -> None:
        github_pieces_names_list = list(compiled_metadata.keys())
        updated_pieces_list = list()
        for piece_name in github_pieces_names_list:
            # Create piece if it does not exist, update if it exists (ignoring version control)
            piece_metadata = compiled_metadata[piece_name]
            self._update_pieces_from_metadata(
                piece_metadata=piece_metadata,
                dependencies_map=dependencies_map,
                repository_id=repository_id
            )
        response_msg = ", ".join(updated_pieces_list) if len(updated_pieces_list) > 0 else "None"
        return response_msg

    def _get_piece_image_by_name(self, dependencies_map: dict, piece_name: str) -> str:
        """Get the group name for the piece dependency

        Args:
            dependencies_map_dict (dict): Dependencies map dictionary
            piece_name (str): Piece name
        """
        self.logger.info(f"Getting dependency group name for piece: {piece_name}")
        for group_dependencies in dependencies_map.values():
            if piece_name in group_dependencies.get('pieces'):
                return group_dependencies.get('source_image')
        return None

    def _update_pieces_from_metadata(self, piece_metadata: dict, dependencies_map: dict, repository_id: int) -> None:
        """Update an piece in database from its metadata

        Args:
            piece_metadata (dict): Piece metadata dictionary
            group_id (int): User groupt that the piece belongs to
        """
        source_image = self._get_piece_image_by_name(dependencies_map=dependencies_map, piece_name=piece_metadata.get('name'))
        piece_metadata["input_schema"]["title"] = piece_metadata.get("name")
        piece_style = piece_metadata.get("style")
        name = piece_metadata.get("name")
        style = get_frontend_node_style(module_name=name, **piece_style)
        new_piece = Piece(
            name=piece_metadata.get("name"),
            dependency=piece_metadata.get("dependency"),
            description=piece_metadata.get("description"),
            source_image=source_image,
            source_url=piece_metadata.get("source_url"),
            input_schema=piece_metadata.get("input_schema", {}),
            output_schema=piece_metadata.get("output_schema", {}),
            secrets_schema=piece_metadata.get("secrets_schema", {}),
            style=style,
            repository_id=repository_id
        )
        db_piece = self.piece_repository.find_by_name_and_repository_id(
            name=name,
            repository_id=repository_id
        )
        if not db_piece:
            self.piece_repository.create(new_piece)
            return
        self.piece_repository.update(new_piece, piece_id=db_piece.id)


    def create_default_storage_pieces(self, piece_repository_id: int = 1) -> None:
        """Create default storage pieces in database
        """
        self.logger.info("Creating default storage pieces")

        pieces = []
        for piece_metadata in DEFAULT_STORAGE_PIECES:
            model = piece_metadata.get('model')()
            piece = Piece(
                name=model.name,
                description=model.description,
                secrets_schema=model.secrets_schema,
                input_schema=model.input_schema,
                repository_id=piece_repository_id
            )
            pieces.append(piece)
        pieces = self.piece_repository.create_many(pieces)
        return pieces



if __name__ == '__main__':
    PieceService().create_default_storage_pieces()



