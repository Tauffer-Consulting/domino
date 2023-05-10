from domino.scripts.load_piece import load_piece_class_from_path, load_piece_models_from_path
from pathlib import Path
import os
import ast
import json


def run_piece():
    # Import Operator from File System, already configured with metadata
    piece_dict = ast.literal_eval(os.getenv("DOMINO_BASHOPERATOR_PIECE"))
    piece_name = piece_dict.get("name")

    pieces_repository_copy_path = Path("opt/airflow/domino/pieces_repository")
    operators_folder_path = pieces_repository_copy_path / "pieces"
    compiled_metadata_path = pieces_repository_copy_path / ".domino/compiled_metadata.json"
    
    with open(str(compiled_metadata_path), "r") as f:
        compiled_metadata = json.load(f)

    piece_class = load_piece_class_from_path(
        operators_folder_path=operators_folder_path,
        piece_name=piece_name,
        piece_metadata=compiled_metadata[piece_name]
    )

    piece_input_model_class, piece_output_model_class, piece_secrets_model_class = load_piece_models_from_path(
        pieces_folder_path=operators_folder_path,
        piece_name=piece_name
    )

    # Instantiate and run Operator
    instantiate_op_dict = ast.literal_eval(os.getenv("DOMINO_BASHOPERATOR_INSTANTIATE_PIECE_KWARGS"))
    piece_object = piece_class(**instantiate_op_dict)

    run_op_dict = ast.literal_eval(os.getenv("DOMINO_BASHOPERATOR_RUN_PIECE_KWARGS"))

    # Get relevant airflow context from ENV
    airflow_context = {
        "dag_owner": os.getenv('AIRFLOW_CONTEXT_DAG_OWNER'),
        "dag_id": os.getenv('AIRFLOW_CONTEXT_DAG_ID'),
        "task_id": os.getenv('AIRFLOW_CONTEXT_TASK_ID'),
        "execution_date": os.getenv('AIRFLOW_CONTEXT_EXECUTION_DATE'),
        "try_number": os.getenv('AIRFLOW_CONTEXT_TRY_NUMBER'),
        "dag_run_id": os.getenv('AIRFLOW_CONTEXT_DAG_RUN_ID'),
        "upstream_task_ids": os.getenv('AIRFLOW_CONTEXT_UPSTREAM_TASK_IDS')  # Added by Domino extended BashOperator
    }

    piece_object.run_piece_function(
        piece_input_model=piece_input_model_class, 
        piece_output_model=piece_output_model_class, 
        piece_secrets_model=piece_secrets_model_class,
        op_kwargs=run_op_dict,
        airflow_context=airflow_context
    )

    return None