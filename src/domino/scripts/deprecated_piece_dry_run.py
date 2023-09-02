"""
Example usage of dry run:

from domino.scripts.piece_dry_run import piece_dry_run

piece_dry_run(
    repository_folder_path=".", 
    piece_name="DownloadPicsumImageOperator", 
    piece_input={
        "width_pixels": 200,
        "height_pixels": 200,
        "save_as_file": False
    }
)
"""
from pathlib import Path
import importlib
import json
import sys




def piece_dry_run(
    repository_folder_path: str, 
    piece_name: str, 
    piece_input: dict,
    secrets_input: dict = None,
    results_path: str = None
):
    if not results_path:
        results_path = Path('./dry_run_results')
        results_path.mkdir(parents=True, exist_ok=True)

    pieces_folder_path = str(Path(repository_folder_path).resolve() / "pieces")
    if pieces_folder_path not in sys.path:
        sys.path.append(pieces_folder_path)

    # Load Operator class
    importlib.invalidate_caches()
    piece_module = importlib.import_module(f"{piece_name}.piece")
    piece_class = getattr(piece_module, piece_name)

    # Load metadata
    metadata_path = Path(pieces_folder_path) / f"{piece_name}/metadata.json"
    with open(metadata_path, "r") as f:
        metadata = json.load(f)
    
    # Set Operator class metadata
    piece_class.set_metadata(metadata=metadata)

    # Load Operator Models
    importlib.invalidate_caches()
    piece_model_module = importlib.import_module(f"{piece_name}.models")
    piece_input_model_class = getattr(piece_model_module, "InputModel")
    piece_output_model_class = getattr(piece_model_module, "OutputModel")
    piece_secrets_model_class = getattr(piece_model_module, "SecretsModel", None)

    # Dry run Operator
    return piece_class.dry_run(
        piece_input=piece_input,
        piece_input_model=piece_input_model_class,
        piece_output_model=piece_output_model_class,
        piece_secrets_model=piece_secrets_model_class,
        secrets_input=secrets_input,
        results_path=str(results_path)
    )
