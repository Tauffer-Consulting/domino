from pathlib import Path
import importlib
import sys


def load_piece_class_from_path(pieces_folder_path: str, piece_name: str, piece_metadata: dict = None):
    # Import Operator from path, then set up piece module and class
    pieces_folder_path = str(Path(pieces_folder_path).resolve())
    if pieces_folder_path not in sys.path:
        sys.path.append(pieces_folder_path)

    importlib.invalidate_caches()
    piece_module = importlib.import_module(f"{piece_name}.piece")
    piece_class = getattr(piece_module, piece_name)

    # Set Operator class metadata
    if piece_metadata:
        piece_class.set_metadata(metadata=piece_metadata)

    return piece_class


def load_piece_models_from_path(pieces_folder_path: str, piece_name: str):
    # Import Operator from mounted volume, then set up piece module and class
    pieces_folder_path = str(Path(pieces_folder_path).resolve())
    if pieces_folder_path not in sys.path:
        sys.path.append(pieces_folder_path)

    importlib.invalidate_caches()
    piece_model_module = importlib.import_module(f"{piece_name}.models")
    piece_input_model_class = getattr(piece_model_module, "InputModel")
    piece_output_model_class = getattr(piece_model_module, "OutputModel")
    piece_secrets_model_class = getattr(piece_model_module, "SecretsModel", None)

    return piece_input_model_class, piece_output_model_class, piece_secrets_model_class