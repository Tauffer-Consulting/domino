from airflow.providers.docker.operators.docker import DockerOperator, Mount
from airflow.utils.context import Context
from typing import Dict, Optional
import os
from domino.client.domino_backend_client import DominoBackendRestClient
from domino.schemas.shared_storage import WorkflowSharedStorage, StorageSource


class DominoDockerOperator(DockerOperator):

    def __init__(
        self,
        piece_name: str,
        deploy_mode: str, # TODO enum
        task_id: str,
        dag_id: str,
        repository_id: int,
        workflow_shared_storage: WorkflowSharedStorage = None,
        piece_kwargs: Optional[Dict] = None, 
        **kwargs
    ) -> None:
        self.running_piece_name = piece_name 
        self.repository_id = repository_id
        self.workflow_shared_storage = workflow_shared_storage
        self.deploy_mode = deploy_mode
        self.running_dag_id = dag_id
        self.task_id = task_id
        self.task_id_replaced = self.task_id.replace("_", "-").lower() # doing this because airflow doesn't allow underscores and upper case in mount names
        self.piece_input_kwargs = piece_kwargs
        # Shared Storage variables
        self.shared_storage_base_mount_path = '/home/shared_storage'
        self.shared_storage_upstream_ids_list = list()
        self.backend_client = DominoBackendRestClient(base_url="http://domino-rest:8000/")
        self._set_base_env_vars()
        docker_url = 'tcp://docker-proxy:2375'
    
        shared_storage_host_path = os.environ.get('LOCAL_DOMINO_SHARED_DATA_PATH', '')
        shared_storage_container_path = '/home/shared_storage'
        mounts = []
        # # TODO remove
        # mounts=[
        #     # TODO remove
        #     Mount(source='/home/vinicius/Documents/work/tauffer/flowui/domino', target='/home/domino/domino_py/domino', type='bind', read_only=True),
        # ]
        if self.workflow_shared_storage and str(self.workflow_shared_storage.source.value).lower() == str(getattr(StorageSource, 'local').value).lower():
            mounts.append(
                Mount(source=shared_storage_host_path, target=shared_storage_container_path, type='bind', read_only=False),
            )

        super().__init__(
            **kwargs, 
            task_id=self.task_id,
            docker_url=docker_url,
            mounts=[
                *mounts,
            ],
            environment=self.environment,
        )
    
    def _set_base_env_vars(self):
        self.environment = {
            "DOMINO_DOCKER_PIECE": self.running_piece_name,
            "DOMINO_DOCKER_INSTANTIATE_PIECE_KWARGS": str({
                "deploy_mode": self.deploy_mode,
                "task_id": self.task_id,
                "dag_id": self.running_dag_id,
            }),
            "DOMINO_DOCKER_RUN_PIECE_KWARGS": str(self.piece_input_kwargs),
            "DOMINO_WORKFLOW_SHARED_STORAGE": self.workflow_shared_storage.json() if self.workflow_shared_storage else "",
            "AIRFLOW_CONTEXT_EXECUTION_DATETIME": "{{ dag_run.logical_date | ts_nodash }}",
            "AIRFLOW_CONTEXT_DAG_RUN_ID": "{{ run_id }}",
        }

    @staticmethod
    def _get_upstream_xcom_data_from_task_ids(task_ids: list, context: 'Context'):
        upstream_xcoms_data = dict()
        for tid in task_ids:
            upstream_xcoms_data[tid] = context['ti'].xcom_pull(task_ids=tid)
        return upstream_xcoms_data

    def _update_piece_kwargs_with_upstream_xcom(self, upstream_xcoms_data: dict):
        #domino_docker_run_piece_kwargs = self.environment.get('DOMINO_DOCKER_RUN_PIECE_KWARGS')
        if not self.piece_input_kwargs:
            self.piece_input_kwargs = dict()
        
        updated_op_kwargs = dict()
        for k, v in self.piece_input_kwargs.items():
            if isinstance(v, dict) and v.get("type", None) == "fromUpstream":
                upstream_task_id = v.get("upstream_task_id")
                output_arg = v.get("output_arg")
                output_value = upstream_xcoms_data[upstream_task_id][output_arg]
                updated_op_kwargs[k] = output_value
                if upstream_task_id not in self.shared_storage_upstream_ids_list:
                    self.shared_storage_upstream_ids_list.append(upstream_task_id)
                continue
            updated_op_kwargs[k] = v
        self.piece_input_kwargs = updated_op_kwargs
        self.environment['AIRFLOW_UPSTREAM_TASKS_IDS_SHARED_STORAGE'] = str(self.shared_storage_upstream_ids_list)
        self.environment['DOMINO_DOCKER_RUN_PIECE_KWARGS'] = str(self.piece_input_kwargs)
    

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
        self.environment['DOMINO_WORKFLOW_SHARED_STORAGE'] = str(self.workflow_shared_storage.source.name) if self.workflow_shared_storage else None
    
        # Save updated piece input kwargs with upstream data to environment variable
        upstream_xcoms_data = self._get_upstream_xcom_data_from_task_ids(task_ids=upstream_task_ids, context=context)
        self._update_piece_kwargs_with_upstream_xcom(upstream_xcoms_data=upstream_xcoms_data)
        piece_secrets = self._get_piece_secrets(piece_repository_id=self.repository_id, piece_name=self.running_piece_name)
        self.environment['DOMINO_DOCKER_PIECE_SECRETS'] = str(piece_secrets)
        dag_id = context["dag_run"].dag_id
        dag_run_id = context['run_id']
        dag_run_id_path = dag_run_id.replace("-", "_").replace(".", "_").replace(" ", "_").replace(":", "_").replace("+", "_")
        self.workflow_run_subpath = f"{dag_id}/{dag_run_id_path}"
        self.environment['DOMINO_WORKFLOW_RUN_SUBPATH'] = self.workflow_run_subpath


    def execute(self, context: Context) -> Optional[str]:
        # env var format = {"name": "value"}
        self._prepare_execute_environment(context=context)
        return super().execute(context=context)


    def _get_piece_secrets(self, piece_repository_id: int, piece_name: str):
        # Get piece secrets values from api and append to env vars
        secrets_response = self.backend_client.get_piece_secrets(
            piece_repository_id=piece_repository_id,
            piece_name=piece_name
        )
        if secrets_response.status_code != 200:
            raise Exception(f"Error getting piece secrets: {secrets_response.json()}")
        piece_secrets = {
            e.get('name'): e.get('value') 
            for e in secrets_response.json()
        }
        return piece_secrets
    