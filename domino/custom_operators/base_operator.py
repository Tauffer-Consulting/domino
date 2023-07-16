from typing import Dict, Optional
from airflow.utils.context import Context

from domino.client.domino_backend_client import DominoBackendRestClient


class BaseDominoOperator:
    """
    This Operator runs Pieces directly in a Worker.
    """

    def __init__(
        self, 
        dag_id: str,
        task_id: str, 
        piece_name: str, 
        repository_id: int, 
        workflow_id: int,
        piece_input_kwargs: Optional[Dict] = None, 
    ):
        self.dag_id = dag_id
        self.task_id = task_id
        self.piece_name = piece_name
        self.repository_id = repository_id
        self.workflow_id = workflow_id
        self.piece_input_kwargs = piece_input_kwargs
        self.backend_client = DominoBackendRestClient(base_url="http://domino-rest:8000/")

    def _get_piece_secrets(self, piece_repository_id: int, piece_name: str):
        """Get piece secrets values from Domino API"""
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
    
    @staticmethod
    def _get_upstream_xcom_data_from_task_ids(task_ids: list, context: Context):
        upstream_xcoms_data = dict()
        for tid in task_ids:
            upstream_xcoms_data[tid] = context['ti'].xcom_pull(task_ids=tid)
        return upstream_xcoms_data