from domino.scripts.load_piece import load_piece_class_from_path, load_piece_models_from_path
from pathlib import Path
import os
import ast
import json


def run_piece():
     # Import Operator from File System, already configured with metadata
    piece_name = os.getenv("DOMINO_PIECE")

    pieces_repository_copy_path = Path("domino/pieces_repository").resolve()
    pieces_folder_path = pieces_repository_copy_path / "pieces"
    compiled_metadata_path = pieces_repository_copy_path / ".domino/compiled_metadata.json"

    with open(str(compiled_metadata_path), "r") as f:
        compiled_metadata = json.load(f)

    piece_class = load_piece_class_from_path(
        pieces_folder_path=pieces_folder_path,
        piece_name=piece_name,
        piece_metadata=compiled_metadata[piece_name]
    )

    piece_input_model_class, piece_output_model_class, piece_secrets_model_class = load_piece_models_from_path(
        pieces_folder_path=pieces_folder_path,
        piece_name=piece_name
    )

    # Instantiate Operator
    instantiate_op_dict = ast.literal_eval(os.getenv("DOMINO_INSTANTIATE_PIECE_KWARGS"))
    piece_object = piece_class(**instantiate_op_dict)

    # Run Operator
    run_piece_input_kwargs = ast.literal_eval(os.getenv("DOMINO_RUN_PIECE_KWARGS"))
    piece_object.run_piece_function(
        piece_input_data=run_piece_input_kwargs,        
        piece_input_model=piece_input_model_class, 
        piece_output_model=piece_output_model_class, 
        piece_secrets_model=piece_secrets_model_class,
    )

    return None