from typing import Dict, Optional
from airflow.utils.context import Context

from domino.client.domino_backend_client import DominoBackendRestClient
from domino.schemas.shared_storage import WorkflowSharedStorage


class BaseDominoOperator:
    """
    This class implements common operations for all Domino Operators running under a Task.
    DEPRECATED - delete this later 
    """

    def __init__(
        self, 
        task_id: str, 
        piece_name: str,  
        deploy_mode: str,
        repository_id: int,
        piece_input_kwargs: Optional[Dict] = None, 
        workflow_shared_storage: WorkflowSharedStorage = None,
        domino_client_url: Optional[str] = None,
    ):
        self.task_id = task_id
        self.piece_name = piece_name
        self.deploy_mode = deploy_mode
        self.repository_id = repository_id
        self.piece_input_kwargs = piece_input_kwargs
        self.workflow_shared_storage = workflow_shared_storage
        if domino_client_url is None:
            domino_client_url = "http://domino-rest:8000/"
        self.domino_client = DominoBackendRestClient(base_url=domino_client_url)

    def _get_piece_secrets(self, piece_repository_id: int, piece_name: str):
        """Get piece secrets values from Domino API"""
        secrets_response = self.domino_client.get_piece_secrets(
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
    
    @staticmethod
    def _get_upstream_xcom_data_from_task_ids(task_ids: list, context: Context):
        upstream_xcoms_data = dict()
        for tid in task_ids:
            upstream_xcoms_data[tid] = context['ti'].xcom_pull(task_ids=tid)
        return upstream_xcoms_data