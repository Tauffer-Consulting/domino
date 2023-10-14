from airflow import DAG
from airflow.models import BaseOperator
from datetime import datetime
from typing import Callable
import os

from domino.custom_operators.k8s_operator import DominoKubernetesPodOperator
from domino.custom_operators.docker_operator import DominoDockerOperator
from domino.custom_operators.python_operator import PythonOperator
from domino.custom_operators.worker_operator import DominoWorkerOperator
from domino.utils import dict_deep_update
from domino.logger import get_configured_logger
from domino.schemas import shared_storage_map, StorageSource


class Task(object):
    """
    The Task object represents a task in a workflow. 
    It is only instantiated by processes parsing dag files in Airflow.
    """
    
    def __init__(
        self, 
        dag: DAG, 
        task_id: str,
        workspace_id: int,
        piece: dict,
        piece_input_kwargs: dict,
        workflow_shared_storage: dict = None,
        container_resources: dict = None,
        **kwargs
    ) -> None:
        # Task configuration and attributes
        self.task_id = task_id
        self.workspace_id = workspace_id
        self.logger = get_configured_logger(f"{self.__class__.__name__ }-{self.task_id}")
        self.logger.info('### Configuring task object ###')
        self.dag = dag
        self.dag_id = self.dag.dag_id
        self.repository_url = piece["repository_url"]
        self.repository_version = piece["repository_version"]
        self.piece = piece
        self.piece_input_kwargs = piece_input_kwargs
        if "execution_mode" not in self.piece:
            self.execution_mode = "docker"
        else:
            self.execution_mode = self.piece["execution_mode"]

        # Shared storage
        if not workflow_shared_storage:
            workflow_shared_storage = {}
        shared_storage_source_name = StorageSource(workflow_shared_storage.pop("source", "None")).name
        provider_options = workflow_shared_storage.pop("provider_options", {})
        if shared_storage_map[shared_storage_source_name]:
            self.workflow_shared_storage = shared_storage_map[shared_storage_source_name](
                **workflow_shared_storage, 
                **provider_options
            ) 
        else: 
            self.workflow_shared_storage = shared_storage_map[shared_storage_source_name]

        # Container resources
        self.container_resources = container_resources
        
        # Get deploy mode
        self.deploy_mode = os.environ.get('DOMINO_DEPLOY_MODE')            

        # Set up task operator
        self._task_operator = self._set_operator()


    def _set_operator(self) -> BaseOperator:
        """
        Set Airflow Operator according to deploy mode and Piece execution mode.
        """
        if self.execution_mode == "worker":
            return DominoWorkerOperator(
                dag_id=self.dag_id,
                task_id=self.task_id,
                piece_name=self.piece.get('name'),
                repository_name=self.piece.get('repository_name'),
                workflow_id=self.piece.get('workflow_id'),
                piece_input_kwargs=self.piece_input_kwargs,
            )

        if self.deploy_mode == "local-python":
            return PythonOperator(
                dag=self.dag,
                task_id=self.task_id,
                start_date=datetime(2021, 1, 1), # TODO - get correct start_date
                provide_context=True,
                op_kwargs=self.piece_input_kwargs,
                # queue=dependencies_group,
                make_python_callable_kwargs=dict(
                    piece_name=self.piece_name,
                    deploy_mode=self.deploy_mode,
                    task_id=self.task_id,
                    dag_id=self.dag_id,
                )
            )

        elif self.deploy_mode in ["local-k8s", "local-k8s-dev", "prod"]:            
            # References: 
            # - https://airflow.apache.org/docs/apache-airflow/1.10.14/_api/airflow/contrib/operators/kubernetes_pod_operator/index.html
            # - https://airflow.apache.org/docs/apache-airflow/stable/templates-ref.html
            # - https://www.astronomer.io/guides/templating/
            # - good example: https://github.com/apache/airflow/blob/main/tests/system/providers/cncf/kubernetes/example_kubernetes.py
            # - commands HAVE to go in a list object: https://stackoverflow.com/a/55149915/11483674
            return DominoKubernetesPodOperator(
                dag_id=self.dag_id,
                task_id=self.task_id,
                piece_name=self.piece.get('name'),
                deploy_mode=self.deploy_mode,
                repository_url=self.repository_url,
                repository_version=self.repository_version,
                workspace_id=self.workspace_id,
                piece_input_kwargs=self.piece_input_kwargs,
                workflow_shared_storage=self.workflow_shared_storage,
                container_resources=self.container_resources,
                # ----------------- Kubernetes -----------------
                namespace='default',  # TODO - separate namespace by User or Workspace?
                image=self.piece.get("source_image"),
                image_pull_policy='IfNotPresent',
                name=f"airflow-worker-pod-{self.task_id}",
                startup_timeout_seconds=600,
                #cmds=["/bin/bash"],
                #arguments=["-c", "sleep 120;"],
                cmds=["domino"],
                arguments=["run-piece-k8s"],
                do_xcom_push=True,
                in_cluster=True,
            )
        
        elif self.deploy_mode == 'local-compose':
            return DominoDockerOperator(
                dag_id=self.dag_id,
                task_id=self.task_id,
                piece_name=self.piece.get('name'),
                deploy_mode=self.deploy_mode,
                repository_url=self.repository_url,
                repository_version=self.repository_version,
                workspace_id=self.workspace_id,
                piece_input_kwargs=self.piece_input_kwargs,
                workflow_shared_storage=self.workflow_shared_storage,
                # ----------------- Docker -----------------
                image=self.piece["source_image"],
                do_xcom_push=True,
                mount_tmp_dir=False,
                tty=True,
                xcom_all=False,
                retrieve_output=True,
                retrieve_output_path='/airflow/xcom/return.out',
                entrypoint=["domino", "run-piece-docker"],
            )


    def __call__(self) -> Callable:
        return self._task_operator