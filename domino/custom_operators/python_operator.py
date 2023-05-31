
from pathlib import Path
import os
import json
from typing import Any, Dict, List, Optional
from airflow.operators.python import PythonOperator as AirflowPythonOperator
from airflow.utils.context import Context

from domino.scripts.load_piece import load_piece_class_from_path, load_piece_models_from_path

# DEPRECATED
def make_python_callable(operator_name, deploy_mode, task_id, dag_id):
    # Import Operator, already configured with metadata, from mounted volume
    volume_mount_path = os.getenv("VOLUME_MOUNT_PATH_DOCKER", "/opt/mnt/fs")
    operators_folder_path = Path(volume_mount_path) / f"code_repository/operators"
    compiled_metadata_path = volume_mount_path / "code_repository/.flowui/compiled_metadata.json"
    with open(str(compiled_metadata_path), "r") as f:
        compiled_metadata = json.load(f)

    operator_class = load_piece_class_from_path(
        operators_folder_path=operators_folder_path.resolve(),
        operator_name=operator_name,
        operator_metadata=compiled_metadata[operator_name]
    )
    operator_object = operator_class(
        deploy_mode=deploy_mode,
        task_id=task_id,
        dag_id=dag_id,
    )

    input_model_class, output_model_class, secrets_model_class = load_piece_models_from_path(
        operators_folder_path=operators_folder_path,
        operator_name=operator_name
    )
    return operator_object.run_piece_function, input_model_class, output_model_class, secrets_model_class


class PythonOperator(AirflowPythonOperator):

    def __init__(
        self, 
        *, 
        op_args: Optional[List] = None, 
        op_kwargs: Optional[Dict] = None, 
        templates_dict: Optional[Dict] = None, 
        templates_exts: Optional[List[str]] = None, 
        show_return_value_in_logs: bool = True,
        make_python_callable_kwargs: Dict,  # Used for setting up the custom operators at execute_callable()
        **kwargs
    ) -> None:
        self.make_python_callable_kwargs = make_python_callable_kwargs
        super().__init__(
            # *,
            python_callable=make_python_callable, 
            op_args=op_args, 
            op_kwargs=op_kwargs, 
            templates_dict=templates_dict, 
            templates_exts=templates_exts, 
            show_return_value_in_logs=show_return_value_in_logs,
            **kwargs
        )
    
    def execute(self, context: Context) -> Any:
        # THIS WAS CHANGED 06/07/2022 to accomodate Domino format for calling run_piece_function

        # context_merge(context, self.op_kwargs, templates_dict=self.templates_dict)
        # self.op_kwargs = self.determine_kwargs(context)

        self.context = context
        self.piece_function, self.operator_input_model_class, self.operator_output_model_class, self.operator_secrets_model_class = self.python_callable(**self.make_python_callable_kwargs)

        return_value = self.execute_callable()

        if self.show_return_value_in_logs:
            self.log.info("Done. Returned value was: %s", return_value)
        else:
            self.log.info("Done. Returned value not shown")

        return return_value

    def execute_callable(self):
        return self.piece_function(
            operator_input_model=self.operator_input_model_class, 
            operator_output_model=self.operator_output_model_class, 
            operator_secrets_model=self.operator_secrets_model_class,
            op_kwargs=self.op_kwargs, 
            airflow_context=self.context
        )