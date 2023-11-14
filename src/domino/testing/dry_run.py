from pathlib import Path
import importlib
import json
import sys
import os
from typing import Optional
from domino.logger import get_configured_logger


def piece_dry_run(
    piece_name: str,
    input_data: dict,
    repository_folder_path: Optional[str] = None,
    secrets_data: dict = None,
    results_path: str = None
) -> dict:
    """
    Example usage of dry run:

    from domino.testing.dry_run import piece_dry_run

    piece_dry_run(
        repository_folder_path=".",
        piece_name="SingleLogPiece",
        input_data={
            "message": "testing msg",
            "input_str": 'testing',
            "input_int": 1,
            ...
        }
    )
    """
    logger = get_configured_logger("piece_dry_run")

    pieces_images_map = os.environ.get("PIECES_IMAGES_MAP", {})
    http_server = None
    if pieces_images_map and piece_name in pieces_images_map:
        try:
            from domino.testing.http_client import TestingHttpClient

            logger.info('Running pieces dry run with http client')
            http_client = TestingHttpClient()
            pieces_images_map = json.loads(pieces_images_map)
            piece_image = pieces_images_map.get(piece_name, None)
            if not piece_image:
                raise Exception(f"Piece {piece_name} not found in PIECES_IMAGES_MAP")
            http_server = http_client.start_http_server(image=piece_image)
            dry_run_response = http_client.send_dry_run_request(piece_name, input_data, secrets_data)
            http_server.stop()
            http_server.remove()
            return dry_run_response.json()
        except Exception as e:
            logger.error(f"Error running dry run with http client: {e}")
            if http_server:
                http_server.stop()
                http_server.remove()
            raise e

    if not repository_folder_path:
        repository_folder_path = '.'
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
    piece_secrets_model_class = getattr(piece_model_module, "SecretsModel", None)
    piece_output_model_class = getattr(piece_model_module, "OutputModel", None)

    # Dry run Operator
    output = piece_class.dry_run(
        input_data=input_data,
        piece_input_model=piece_input_model_class,
        piece_output_model=piece_output_model_class,
        piece_secrets_model=piece_secrets_model_class,
        secrets_data=secrets_data,
        results_path=str(results_path)
    )
    return json.loads(output.model_dump_json())
