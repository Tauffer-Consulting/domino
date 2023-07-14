from pathlib import Path
import importlib
import json
import sys
import time
import os
from typing import Optional
import docker
import requests
from requests.exceptions import ConnectionError, Timeout

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

# TODO improve this file organization, naming and logic

def wait_health_check():
    max_retries = 5
    retry_delay_in_seconds = 1
    url = "http://localhost:8080/health-check"
    for _ in range(max_retries):
        try:
            response = requests.get(url)
            response.raise_for_status()
            return response
        except (ConnectionError, Timeout) as e:
            print(f"Health Check Failed.\nRetrying in {retry_delay_in_seconds} seconds...")
            time.sleep(retry_delay_in_seconds)
    raise Exception("Max retries exceeded. Unable to make the request.")


def start_http_server(image: str):
    client = docker.from_env()
    try:
        container = client.containers.run(
            image=image,
            command="python domino/domino_py/domino/testing/http_server.py",
            ports={'8080/tcp': ('0.0.0.0', 8080)},
            detach=True
        )
        container_state = container.attrs.get('State').get('Running')
        container_status = container.attrs.get('State').get('Status', None)
        while not container_state and container_status != 'running':
            container = client.containers.get(container.id)
            container_state = container.attrs.get('State').get('Running')
            container_status = container.attrs.get('State').get('Status')
            print('Waiting for container to start...')
            time.sleep(0.2)
        wait_health_check()
        return container
    except Exception as e:
        container = client.containers.get('domino_testing_http_server')
        if container:
            container.stop()
            container.remove()
        raise e

def send_dry_run_request(
    piece_name: str,
    input_data: dict,
    secrets_data: dict
):
    url = "http://localhost:8080/test"
    body_data = dict(
        piece_name=piece_name,
        input_data=input_data,
        secrets_data=secrets_data,
        repository_folder_path="/home/domino/pieces_repository/"
    )

    response = requests.post(url, json=body_data)
    return response
    

def piece_dry_run(
    piece_name: str, 
    input_data: dict,
    repository_folder_path: Optional[str] = None, 
    secrets_data: dict = None,
    results_path: str = None
):

    # TODO finish adding the pieces images map to docker build images
    # By now to test you should export this env variable , you can use a local image if you want to test a piece built with local version of domino
    # To build a piece with local version of domino you can build the pod dockerfile locally and 
    # then use the local pod image in the build_docker_images_pieces.py in temporary Dockerfile generation to use this local image
    # Example: export PIECES_IMAGES_MAP='{"SimpleLogPiece": "local/default_domino_pieces:0.3.9-group0"}'
    pieces_images_map = os.environ.get("PIECES_IMAGES_MAP", None)
    if pieces_images_map:
        print('Running pieces dry run with http')
        pieces_images_map = json.loads(pieces_images_map)
        piece_image = pieces_images_map.get(piece_name, None)
        if not piece_image:
            raise Exception(f"Piece {piece_name} not found in PIECES_IMAGES_MAP")
        http_server = start_http_server(image=piece_image)
        dry_run_response = send_dry_run_request(piece_name, input_data, secrets_data)
        http_server.stop()
        http_server.remove()
        # TODO add piece output model to keep the pattern of returning OutputModel from piece_dry_run
        return dry_run_response.json()

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

    # Dry run Operator
    output = piece_class.dry_run(
        input_data=input_data,
        piece_input_model=piece_input_model_class,
        piece_secrets_model=piece_secrets_model_class,
        secrets_data=secrets_data,
        results_path=str(results_path)
    )
    return output
