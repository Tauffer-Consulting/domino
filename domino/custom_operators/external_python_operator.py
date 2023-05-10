from airflow.operators.python import ExternalPythonOperator as AirflowExternalPythonOperator
from airflow.utils.context import Context
from pathlib import Path
import os
from domino.client.domino_backend_client import DominoBackendRestClient
import json
from typing import Any, Dict, List, Optional
from domino.scripts.load_piece import load_piece_class_from_path, load_piece_models_from_path


def make_python_callable(piece_name, task_id, deploy_mode, dag_id):
    pieces_repository_path = Path('/opt/airflow/domino/pieces_repository')
    pieces_folder = pieces_repository_path / f"pieces"
    compiled_metadata_path = pieces_repository_path / ".domino/compiled_metadata.json"

    with open(str(compiled_metadata_path), "r") as f:
        compiled_metadata = json.load(f)

    piece_class = load_piece_class_from_path(
        pieces_folder_path=pieces_folder.resolve(),
        piece_name=piece_name,
        piece_metadata=compiled_metadata[piece_name]
    )
    piece_object = piece_class(
        deploy_mode=deploy_mode,
        task_id=task_id,
        dag_id=dag_id,
    )

    input_model_class, output_model_class, secrets_model_class = load_piece_models_from_path(
        pieces_folder_path=pieces_folder,
        piece_name=piece_name
    )
    return piece_object, input_model_class, output_model_class, secrets_model_class

class DominoExternalPythonOperator(AirflowExternalPythonOperator):
    def __init__(
        self,
        piece_name: str,
        repository_id: int,
        piece_kwargs: Optional[Dict] = None, 
        make_python_callable_kwargs: Dict = None,  # Used for setting up the custom pieces at execute_callable()
        venv_path=None,
        **kwargs
    ) -> None:
        self.venv_path = venv_path
        self.piece_kwargs = piece_kwargs
        self.make_python_callable_kwargs = make_python_callable_kwargs
        self.backend_client = DominoBackendRestClient(base_url="http://domino-rest:8000/")
        self.running_piece_name = piece_name
        self.repository_id = repository_id
        if self.venv_path is None:
            self.venv_path = '/opt/airflow/domino/venv/bin/python'
        super().__init__(
            python=self.venv_path,
            python_callable=make_python_callable,
            **kwargs
        )


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

    def _update_piece_kwargs_with_upstream_xcom(self, upstream_xcoms_data: dict):
        #domino_k8s_run_op_kwargs = [var for var in self.env_vars if getattr(var, 'name', None) == 'DOMINO_K8S_RUN_PIECE_KWARGS']
        #domino_k8s_run_piece_kwargs = self.piece_kwargs
        if not self.piece_kwargs:
            self.piece_kwargs = dict()

        # Update Operator kwargs with upstream tasks XCOM data
        # Also updates the list of upstream tasks for which we need to mount the results path
        updated_op_kwargs = dict()
        for k, v in self.piece_kwargs.items():
            if isinstance(v, dict) and v.get("type", None) == "fromUpstream":
                upstream_task_id = v.get("upstream_task_id")
                output_arg = v.get("output_arg")
                output_value = upstream_xcoms_data[upstream_task_id][output_arg]
                output_type = upstream_xcoms_data[upstream_task_id][f"{output_arg}_type"]
                # If upstream output type is FilePath or DirectoryPath, we need to add the basic path prefix
                # if output_type in ["file-path", "directory-path"]:
                #     output_value = f"{self.shared_storage_base_mount_path}/{upstream_task_id}/results/{output_value}"
                updated_op_kwargs[k] = output_value
                if upstream_task_id not in self.shared_storage_upstream_ids_list:
                    self.shared_storage_upstream_ids_list.append(upstream_task_id)
            else:
                updated_op_kwargs[k] = v
        self.piece_kwargs = updated_op_kwargs

    def _get_upstream_xcom_data(self, context: Context):
        upstream_task_ids = [t.task_id for t in self.get_direct_relatives(upstream=True)]

        upstream_xcoms_data = dict()
        for tid in upstream_task_ids:
            upstream_xcoms_data[tid] = context['ti'].xcom_pull(task_ids=tid)
        return upstream_xcoms_data


    def execute(self, context: Context) -> Any:
        self.context = context
        upstream_xcom_data = self._get_upstream_xcom_data(context=context)

        self._update_piece_kwargs_with_upstream_xcom(upstream_xcoms_data=upstream_xcom_data)
        self.piece_object, self.piece_input_model_class, self.piece_output_model_class, self.piece_secrets_model_class = self.python_callable(**self.make_python_callable_kwargs)
        return_value = self.execute_callable()
        return return_value
    
    def execute_callable(self):
        piece_secrets = self._get_piece_secrets(piece_repository_id=self.repository_id, piece_name=self.running_piece_name)
        self.piece_object.run_piece_function(
            airflow_context=self.context,
            op_kwargs=self.piece_kwargs,
            piece_input_model=self.piece_input_model_class,
            piece_output_model=self.piece_output_model_class, 
            piece_secrets_model=self.piece_secrets_model_class,
            secrets_values=piece_secrets
        )
        
        return None