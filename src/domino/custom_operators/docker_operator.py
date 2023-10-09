from airflow.providers.docker.operators.docker import DockerOperator, Mount
from airflow.utils.context import Context
from typing import Dict, Optional, Any
import os

from domino.client.domino_backend_client import DominoBackendRestClient
from domino.schemas import WorkflowSharedStorage, StorageSource


class DominoDockerOperator(DockerOperator):

    def __init__(
        self,
        dag_id: str,
        task_id: str,
        piece_name: str,
        deploy_mode: str, # TODO enum
        repository_url: str,
        repository_version: str,
        workspace_id: int,
        piece_input_kwargs: Optional[Dict] = None, 
        workflow_shared_storage: WorkflowSharedStorage = None,
        **docker_operator_kwargs
    ) -> None:
        self.task_id = task_id
        self.piece_name = piece_name
        self.deploy_mode = deploy_mode
        self.repository_url = repository_url
        self.repository_version = repository_version
        self.workspace_id = workspace_id
        self.piece_input_kwargs = piece_input_kwargs
        self.workflow_shared_storage = workflow_shared_storage

        # Environment variables
        self.environment = {
            "DOMINO_PIECE": piece_name,
            "DOMINO_INSTANTIATE_PIECE_KWARGS": str({
                "deploy_mode": deploy_mode,
                "task_id": task_id,
                "dag_id": dag_id,
            }),
            "DOMINO_RUN_PIECE_KWARGS": str(piece_input_kwargs),
            "DOMINO_WORKFLOW_SHARED_STORAGE": self.workflow_shared_storage.json() if self.workflow_shared_storage else "",
            "AIRFLOW_CONTEXT_EXECUTION_DATETIME": "{{ dag_run.logical_date | ts_nodash }}",
            "AIRFLOW_CONTEXT_DAG_RUN_ID": "{{ run_id }}",
        }

        # Shared Storage variables
        self.shared_storage_base_mount_path = '/home/shared_storage'
        self.shared_storage_upstream_ids_list = list()
        shared_storage_host_path = os.environ.get('LOCAL_DOMINO_SHARED_DATA_PATH', '')
        shared_storage_container_path = '/home/shared_storage'
        mounts = []
        
        # TODO remove - used in DEV only
        mounts=[
            # TODO remove
            # Mount(source='/home/vinicius/Documents/work/tauffer/domino/src/domino', target='/home/domino/domino_py/src/domino', type='bind', read_only=True),
            # Mount(source='/home/nathan/Documentos/github.com/Tauffer-Consulting/domino/src/domino', target='/home/domino/domino_py/domino', type='bind', read_only=True),
            # Mount(source='/media/luiz/storage2/Github/domino/src/domino', target='/home/domino/domino_py/src/domino', type='bind', read_only=True),
            # Mount(source='/media/luiz/storage2/Github/default_domino_pieces', target='/home/domino/pieces_repository/', type='bind', read_only=True),
        ]
        if self.workflow_shared_storage and str(self.workflow_shared_storage.source.value).lower() == str(getattr(StorageSource, 'local').value).lower():
            mounts.append(
                Mount(
                    source=shared_storage_host_path, 
                    target=shared_storage_container_path, 
                    type='bind', 
                    read_only=False
                ),
            )

        super().__init__(
            **docker_operator_kwargs, 
            task_id=task_id,
            docker_url='tcp://docker-proxy:2375',
            mounts=mounts,
            environment=self.environment,
        )
    

    def _get_piece_secrets(self) -> Dict[str, Any]:
        """Get piece secrets values from Domino API"""
        params = {
            "workspace_id": self.workspace_id,
            "url": self.repository_url,
            "version": self.repository_version,
            "page": 0,
            "page_size": 1,
        }

        piece_repository_data = self.domino_client.get_piece_repositories_from_workspace_id(
            params=params
        ).json()
        secrets_response = self.domino_client.get_piece_secrets(
            piece_repository_id=piece_repository_data["data"][0]["id"],
            piece_name=self.piece_name
        )
        if secrets_response.status_code != 200:
            raise Exception(f"Error getting piece secrets: {secrets_response.json()}")
        piece_secrets = {
            e.get('name'): e.get('value') 
            for e in secrets_response.json()
        }
        return piece_secrets
    

    @staticmethod
    def _get_upstream_xcom_data_from_task_ids(task_ids: list, context: Context):
        upstream_xcoms_data = dict()
        for tid in task_ids:
            upstream_xcoms_data[tid] = context['ti'].xcom_pull(task_ids=tid)
        return upstream_xcoms_data


    def _get_piece_kwargs_value_from_upstream_xcom(
        self, 
        value: Any
    ):
        if isinstance(value, dict) and value.get("type") == "fromUpstream":
            upstream_task_id = value["upstream_task_id"]
            output_arg = value["output_arg"]
            if upstream_task_id not in self.shared_storage_upstream_ids_list:
                self.shared_storage_upstream_ids_list.append(upstream_task_id)
            return self.upstream_xcoms_data[upstream_task_id][output_arg]
        elif isinstance(value, list):
            return [self._get_piece_kwargs_value_from_upstream_xcom(item) for item in value]
        elif isinstance(value, dict):
            return {
                k: self._get_piece_kwargs_value_from_upstream_xcom(v) 
                for k, v in value.items()
            }
        return value


    def _update_piece_kwargs_with_upstream_xcom(self):
        if not self.piece_input_kwargs:
            self.piece_input_kwargs = dict()
        
        updated_piece_kwargs = {
            k: self._get_piece_kwargs_value_from_upstream_xcom(
                value=v
            ) for k, v in self.piece_input_kwargs.items()
        }
        self.piece_input_kwargs = updated_piece_kwargs
        self.environment['AIRFLOW_UPSTREAM_TASKS_IDS_SHARED_STORAGE'] = str(self.shared_storage_upstream_ids_list)
        self.environment['DOMINO_RUN_PIECE_KWARGS'] = str(self.piece_input_kwargs)


    def _prepare_execute_environment(self, context: Context):
        """ 
        Prepare execution with the following configurations:
        - pass extra arguments and configuration as environment variables to the pod
        - add shared storage sidecar container to the pod - if shared storage is FUSE based
        - add shared storage volume mounts to the pod - if shared storage is NFS based or local
        """
        # Fetch upstream tasks ids and save them in an ENV var
        upstream_task_ids = [t.task_id for t in self.get_direct_relatives(upstream=True)]
        self.environment['AIRFLOW_UPSTREAM_TASKS_IDS'] = str(upstream_task_ids)
        self.environment['DOMINO_WORKFLOW_SHARED_STORAGE_SOURCE_NAME'] = str(self.workflow_shared_storage.source.name) if self.workflow_shared_storage else None
    
        # Save updated piece input kwargs with upstream data to environment variable
        self.upstream_xcoms_data = self._get_upstream_xcom_data_from_task_ids(task_ids=upstream_task_ids, context=context)
        self._update_piece_kwargs_with_upstream_xcom()

        piece_secrets = self._get_piece_secrets()
        self.environment['DOMINO_PIECE_SECRETS'] = str(piece_secrets)

        dag_id = context["dag_run"].dag_id
        dag_run_id = context['run_id']
        dag_run_id_path = dag_run_id.replace("-", "_").replace(".", "_").replace(" ", "_").replace(":", "_").replace("+", "_")
        self.workflow_run_subpath = f"{dag_id}/{dag_run_id_path}"
        self.environment['DOMINO_WORKFLOW_RUN_SUBPATH'] = self.workflow_run_subpath


    def execute(self, context: Context) -> Optional[str]:
        """
        Code from here onward is executed by the Worker and not by the Scheduler.
        """
        self.domino_client = DominoBackendRestClient(base_url="http://domino-rest:8000/")
        # env var format = {"name": "value"}
        self._prepare_execute_environment(context=context)
        return super().execute(context=context)
