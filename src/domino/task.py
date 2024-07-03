from airflow import DAG
from typing import Callable
import os
from domino.custom_operators.base_operator import DominoBaseOperator
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
        init_operator: bool = True,
        #**kwargs
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

        self.container_resources = container_resources
        self.deploy_mode = os.environ.get('DOMINO_DEPLOY_MODE')

        # Set up task operator
        if not init_operator:
            self._task_operator = None
        else:
            self._task_operator = DominoBaseOperator(
                dag_id=self.dag_id,
                task_id=self.task_id,
                piece_name=self.piece.get("name"),
                deploy_mode=self.deploy_mode,
                repository_url=self.repository_url,
                repository_version=self.repository_version,
                workspace_id=self.workspace_id,
                piece_input_kwargs=self.piece_input_kwargs,
                workflow_shared_storage=self.workflow_shared_storage,
                container_resources=self.container_resources,
                piece_source_image=self.piece.get("source_image"),
            )

    def __call__(self) -> Callable:
        return self._task_operator
