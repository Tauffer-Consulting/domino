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
        deploy_mode: str, # TODO enum
        repository_id: int,
        piece_input_kwargs: Optional[Dict] = None, 
    ):
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

    def execute(self, context):
        """Execute the Piece."""
        # TODO
        pass