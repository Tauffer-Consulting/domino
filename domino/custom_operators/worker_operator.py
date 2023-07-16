from typing import Dict, Optional
from airflow.models import BaseOperator

from domino.client.domino_backend_client import DominoBackendRestClient


# This is  WIP, not working yet.

class DominoWorkerOperator(BaseOperator):
    """
    This Operator runs Pieces directly in a Worker.
    """

    def __init__(
        self, 
        dag_id: str,
        task_id: str, 
        piece_name: str, 
        repository_name: str, 
        workflow_id: int,
        piece_input_kwargs: Optional[Dict] = None, 
    ):
        self.dag_id = dag_id
        self.task_id = task_id
        self.piece_name = piece_name
        self.repository_name = repository_name
        self.workflow_id = workflow_id
        self.piece_input_kwargs = piece_input_kwargs
        self.backend_client = DominoBackendRestClient(base_url="http://domino-rest:8000/")

        self._get_piece_class()
        self._get_piece_secrets()
        self._get_airflow_conn_id()

    def _get_piece_class(self):
        # TODO
        pass

    def _get_airflow_conn_id(self):
        """
        Form correct conn_id string with conn_type + repository_id.
        Check if conn_id already exists in Airflow and, if not, create it.
        """
        # TODO
        conn_type = "aws"  # TODO: get from piece
        self.conn_id = f"{conn_type}_{self.repository_id}"
        try:
            response = self.backend_client.check_create_airflow_connection(
                conn_id=self.conn_id,
                conn_type=conn_type,
            )
        except Exception as e:
            raise e
        
    def _get_piece_secrets(self, piece_repository_id: int, piece_name: str):
        # Get piece secrets values from api and append to env vars
        # TODO
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

    def execute(self, context):
        """Execute the Piece."""
        # TODO
        pass