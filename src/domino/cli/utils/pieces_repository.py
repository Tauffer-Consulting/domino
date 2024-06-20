import tomli
import tomli_w
import json
import jsonschema
import subprocess
import copy
import uuid
import os
import re
import shutil
import time
from pathlib import Path
from rich.console import Console
from typing import Union

from domino.cli.utils.constants import COLOR_PALETTE
from domino.client.github_rest_client import GithubRestClient
from domino.utils import dict_deep_update
from domino.exceptions.exceptions import ValidationError
from domino.cli.utils import templates


console = Console()


class SetEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, set):
            return list(obj)
        return json.JSONEncoder.default(self, obj)


CONFIG_REQUIRED_FIELDS = {}


def validate_github_token(token: str) -> bool:
    """
    Validate DOMINO_GITHUB_ACCESS_TOKEN
    By now it is only accepting the ghp token.

    Args:
        token (str): Github access token (ghp)

    Returns:
        bool: True if token is valid, False otherwise.
    """
    regex = r"ghp_[0-9a-zA-Z]{35,40}"
    pattern = re.compile(regex)
    if pattern.match(token):
        return True
    return False


REQUIRED_ENV_VARS_VALIDATORS = {
    "DOMINO_DEFAULT_PIECES_REPOSITORY_TOKEN": {
        "depends": lambda arg: arg.get('OPERATORS_REPOSITORY_SOURCE') == 'github',
        "validator_func": validate_github_token
    },
    "DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS": {
        "depends": lambda arg: arg.get('OPERATORS_REPOSITORY_SOURCE') == 'github',
        "validator_func": validate_github_token
    }
}


def set_config_as_env(key: str, value: Union[str, int, float]) -> None:
    """
    Set an ENV variable with the key and value.

    Args:
        key (Union[str, int]): ENV var name
        value (Union[str, int, float]): ENV var value
    """
    key = str(key).strip().upper()
    os.environ[key] = str(value)


def validate_repository_name(name: str) -> bool:
    regex = r'^[A-Za-z0-9_]*$'
    pattern = re.compile(regex)
    if pattern.match(name):
        return True
    return False


def validate_env_vars() -> None:
    """
    Validate user environment variables.
    The accepted variables are:
        - GITHUB_ACCESS_TOKEN: Token to access GitHub API.
    """
    # Set AIRFLOW_UID from host user id
    # https://airflow.apache.org/docs/apache-airflow/stable/start/docker.html#setting-the-right-airflow-user
    # https://airflow.apache.org/docs/apache-airflow/stable/start/docker.html#environment-variables-supported-by-docker-compose
    uid = subprocess.run(["id", "-u"], capture_output=True, text=True)
    set_config_as_env("AIRFLOW_UID", int(uid.stdout))

    for var, validator in REQUIRED_ENV_VARS_VALIDATORS.items():
        if 'depends' in validator:
            should_exist = validator.get('depends')(CONFIG_REQUIRED_FIELDS)
        if not should_exist:
            continue
        env_var = os.environ.get(var, None)
        if env_var:
            continue
        console.print(f"{var} is not defined", style=f"bold {COLOR_PALETTE.get('warning')}")
        new_var = input(f"Enter the {var} value: ")
        while not validator.get('validator_func')(new_var):
            new_var = input(f"Wrong {var} format. Enter a new value: ")
        os.environ[var] = new_var


def validate_config(config_dict: dict) -> None:
    """
    Validate config.toml file.
    """
    required_fields = ["REGISTRY_NAME", "REPOSITORY_NAME", "VERSION"]
    sections = config_dict.keys()
    for section in sections:
        for key, value in config_dict.get(section).items():
            # Check if required fields were defined in config file
            if key in required_fields:
                required_fields.remove(key)
                # Set config vars as env vars, it will be used by docker build
                set_config_as_env(key, value)
    if len(required_fields) > 0:
        console.print("Missing required fields: {}".format(required_fields), style=f"bold {COLOR_PALETTE.get('error')}")


def validate_repository_structure() -> None:
    """
    Validate the Pieces repository structure.
    The basic initial structure must contain:
    - config.toml
    - pieces/
    - dependencies/
    """

    organized_domino_path = Path(".") / ".domino/"
    if not organized_domino_path.is_dir():
        organized_domino_path.mkdir(parents=True, exist_ok=True)

    # Validating config
    config_path = Path(".") / 'config.toml'
    if not config_path.is_file():
        console.print("Missing config.toml file", style=f"bold {COLOR_PALETTE.get('error')}")
        raise FileNotFoundError("Missing config.toml file")

    with open(config_path, "rb") as f:
        config_dict = tomli.load(f)

    validate_config(config_dict)
    validate_env_vars()

    pieces_repository = Path(".")
    if not pieces_repository.is_dir():
        console.print("Pieces repository path does not exist", style=f"bold {COLOR_PALETTE.get('error')}")
        raise Exception("Pieces repository path does not exist")

    if not (pieces_repository / 'pieces').is_dir():
        console.print("Pieces directory does not exist", style=f"bold {COLOR_PALETTE.get('error')}")
        raise Exception("Pieces directory does not exist")

    if not (pieces_repository / 'dependencies').is_dir():
        console.print("Dependencies directory does not exist", style=f"bold {COLOR_PALETTE.get('error')}")
        raise Exception("Dependencies directory does not exist")

    # os.environ['OPERATORS_REPOSITORY_PATH_HOST'] = str(pieces_repository)


def validate_pieces_folders() -> None:
    """
    Validate the Pieces folders from an Pieces repository.
    """
    from domino.schemas import PieceMetadata

    pieces_path = Path(".") / "pieces"
    dependencies_path = Path(".") / "dependencies"
    organized_domino_path = Path(".") / ".domino/"
    dependencies_files = [f.name for f in dependencies_path.glob("*")]
    name_errors = list()
    missing_file_errors = list()
    missing_dependencies_errors = list()
    for op_dir in pieces_path.glob("*Piece"):
        if op_dir.is_dir():
            # Validate necessary files exist
            files_names = [f.name for f in op_dir.glob("*")]
            if 'models.py' not in files_names:
                missing_file_errors.append(f"missing 'models.py' for {op_dir.name}")
            if 'piece.py' not in files_names:
                missing_file_errors.append(f"missing 'piece.py' for {op_dir.name}")
            if len(missing_file_errors) > 0:
                raise Exception('\n'.join(missing_file_errors))

            # Validate metadata
            if (op_dir / "metadata.json").is_file():
                with open(str(op_dir / "metadata.json"), "r") as f:
                    metadata = json.load(f)
                jsonschema.validate(instance=metadata, schema=PieceMetadata.model_json_schema())

                # Validate Pieces name
                if metadata.get("name", None) and not metadata["name"] == op_dir.name:
                    name_errors.append(op_dir.name)

                # Validate dependencies exist
                if metadata.get("dependency", None):
                    req_file = metadata["dependency"].get("requirements_file", None)
                    if req_file and req_file != "default" and req_file not in dependencies_files:
                        missing_dependencies_errors.append(f'missing dependency file {req_file} defined for {op_dir.name}')

                    dock_file = metadata["dependency"].get("dockerfile", None)
                    if dock_file and dock_file != "default" and dock_file not in dependencies_files:
                        missing_dependencies_errors.append(f'missing dependency file {dock_file} defined for {op_dir.name}')

    if len(name_errors) > 0:
        raise Exception(f"The following Pieces have inconsistent names: {', '.join(name_errors)}")
    if len(missing_dependencies_errors) > 0:
        raise Exception("\n" + "\n".join(missing_dependencies_errors))

def _validate_piece_name(name: str):
    """
    Validate given piece name.
    """
    if len(name) == 0:
        raise ValidationError(f"Piece name must have at least one character.")
    regex = r'^[A-Za-z_][A-Za-z0-9_]*Piece$'
    pattern = re.compile(regex)
    if not pattern.match(name):
        raise ValidationError(f"{name} is not a valid piece name. Piece name must be valid Python class name and must end with 'Piece'.")

def create_piece(name: str, piece_repository: str):
    """
    Create a new piece directory with necessary files.
    """
    try:
        _validate_piece_name(name)
        piece_dir = os.path.join(piece_repository, name)
        os.mkdir(piece_dir)

        with open(f"{piece_dir}/piece.py", "x") as f:
            piece = templates.piece_function(name)
            f.write(piece)

        with open(f"{piece_dir}/models.py", "x") as f:
            models = templates.piece_models(name)
            f.write(models)

        with open(f"{piece_dir}/test_{name}.py", "x") as f:
            test = templates.piece_test(name)
            f.write(test)
        
        with open(f"{piece_dir}/metadata.json", "x") as f:
            metadata = templates.piece_metadata(name)
            json.dump(metadata, f, indent = 4)

        console.print(f"{name} is created in {piece_repository}.", style=f"bold {COLOR_PALETTE.get('success')}")
    except ValidationError as err:
        console.print(f"{err}", style=f"bold {COLOR_PALETTE.get('error')}")
    except OSError as err: # todo: create a wrapper for this
        if err.errno == 17:
            console.print(f"{name} is already exists in {piece_repository}.", style=f"bold {COLOR_PALETTE.get('error')}")
        elif err.errno == 2:
            console.print(f"{piece_repository} is not a valid repository path.", style=f"bold {COLOR_PALETTE.get('error')}")
        else:
            console.print(f"{err}", style=f"bold {COLOR_PALETTE.get('error')}")

def create_pieces_repository(repository_name: str, container_registry: str) -> None:
    """
    Create a new Pieces repository from template, with folder structure and placeholder files.
    """
    while not validate_repository_name(repository_name):
        repository_name = input("\nInvalid repository name. Should have only numbers, letters and underscores. \nEnter a new repository name: ") or f"new_repository_{str(uuid.uuid4())[0:8]}"
    cwd = Path.cwd()
    repository_folder = cwd / repository_name
    if repository_folder.is_dir():
        raise Exception("Repository folder already exists")
    console.print(f"Cloning template Pieces repository at: {repository_folder}")
    subprocess.run(["git", "clone", "https://github.com/Tauffer-Consulting/domino_pieces_repository_template.git", repository_name], capture_output=True, text=True)
    shutil.rmtree(f"{repository_name}/.git")

    # Update config
    with open(f"{repository_name}/config.toml", "rb") as f:
        repo_config = tomli.load(f)

    repo_config["repository"]["REPOSITORY_NAME"] = repository_name
    repo_config["repository"]["REGISTRY_NAME"] = container_registry if container_registry else "enter-your-github-registry-name-here"

    with open(f"{repository_name}/config.toml", "wb") as f:
        tomli_w.dump(repo_config, f)

    console.print(f"Pieces repository successfully create at: {repository_folder}", style=f"bold {COLOR_PALETTE.get('success')}")
    console.print("")


def create_compiled_pieces_metadata(source_url: str | None = None) -> None:
    """
    Create compiled metadata from Pieces metadata.json files and include input_schema generated from models.py
    """
    from domino.scripts.load_piece import load_piece_models_from_path
    from domino.utils.metadata_default import metadata_default

    pieces_path = Path(".") / "pieces"
    compiled_metadata = dict()
    for op_dir in pieces_path.glob("*Piece"):
        if op_dir.is_dir():
            piece_name = op_dir.name

            # Update with user-defined metadata.json
            metadata = copy.deepcopy(metadata_default)
            if (op_dir / "metadata.json").is_file():
                with open(str(op_dir / "metadata.json"), "r") as f:
                    metadata_op = json.load(f)
                metadata_op['name'] = metadata_op.get('name', piece_name)
                dict_deep_update(metadata, metadata_op)
            else:
                metadata['name'] = piece_name

            # Add input and output schemas
            input_model_class, output_model_class, secrets_model_class = load_piece_models_from_path(
                pieces_folder_path=str(pieces_path),
                piece_name=op_dir.name
            )
            metadata["input_schema"] = input_model_class.model_json_schema()
            metadata["output_schema"] = output_model_class.model_json_schema()
            metadata["secrets_schema"] = secrets_model_class.model_json_schema() if secrets_model_class else None

            # Add source code url
            metadata["source_url"] = None
            if source_url and len(source_url) > 0:
                metadata["source_url"] = source_url + f"/tree/main/pieces/{piece_name}"

            # Add to compiled metadata
            compiled_metadata[piece_name] = metadata

    # Save compiled_metadata.json file
    organized_domino_path = Path(".") / ".domino/"
    with open(str(organized_domino_path / "compiled_metadata.json"), "w") as f:
        json.dump(compiled_metadata, f, indent=4)


def create_dependencies_map(save_map_as_file: bool = True) -> None:
    """
    Construct a map between Pieces and unique definitions for docker images dependencies

    Args:
        save_map_as_file (bool, optional): Set if dependencies_map will be saved as file. Defaults to True.

    Raises:
        ValueError: Raise if pieces is not found in the pieces_repository
    """
    organized_domino_path = Path(".") / ".domino/"
    with open(organized_domino_path / "compiled_metadata.json", "r") as f:
        compiled_metadata = json.load(f)

    pieces_images_map = {}
    for op_i, (piece_name, piece_metadata) in enumerate(compiled_metadata.items()):

        if piece_metadata.get("secrets_schema"):
            piece_secrets = set(piece_metadata.get("secrets_schema")["properties"].keys())
        else:
            piece_secrets = set()

        if op_i == 0:
            pieces_images_map = {
                f"group0": {
                    "dependency": piece_metadata["dependency"],
                    "pieces": [piece_name],
                    "secrets": piece_secrets
                }
            }
        else:
            # Compare with metadata from previous pieces to see if a new docker image needs to be built
            existing_keys = pieces_images_map.keys()
            skip_new_image = False
            for i, dep_key in enumerate(existing_keys):
                if all([piece_metadata["dependency"][k] == pieces_images_map[dep_key]["dependency"][k] for k in piece_metadata["dependency"].keys()]):
                    pieces_images_map[dep_key]["pieces"].append(piece_name)
                    pieces_images_map[dep_key]["secrets"].update(piece_secrets)
                    skip_new_image = True
                    continue
            if not skip_new_image:
                pieces_images_map[f"group{len(existing_keys)}"] = {
                    "dependency": piece_metadata["dependency"],
                    "pieces": [piece_name],
                    "secrets": piece_secrets
                }

    if not pieces_images_map:
        raise ValueError("No pieces found in the Pieces Repository")

    if save_map_as_file:
        map_file_path = organized_domino_path / "dependencies_map.json"
        with open(map_file_path, "w") as outfile:
            json.dump(pieces_images_map, outfile, indent=4, cls=SetEncoder)


def build_docker_images(tag_overwrite: str | None = None, dev: bool = False) -> None:
    """
    Convenience function to build Docker images from the repository dependencies and publish them to Docker Hub
    """
    from domino.scripts.build_docker_images_pieces import build_images_from_pieces_repository

    console.print("Building Docker images and generating map file...")
    updated_dependencies_map = build_images_from_pieces_repository(tag_overwrite=tag_overwrite, dev=dev)
    return updated_dependencies_map


def publish_docker_images() -> None:
    """
    Load pieces to docker image map from environment variable and publish them to Container Registry.
    This is used in the CI/CD pipeline to publish images to Container Registry after they are built and the tests pass.
    """
    from domino.scripts.build_docker_images_pieces import publish_image

    pieces_images_map = json.loads(os.environ.get('PIECES_IMAGES_MAP', '{}'))
    if not pieces_images_map:
        raise ValueError("No images found to publish.")

    console.print("Publishing Docker images...")
    all_images = set([e for e in pieces_images_map.values()])
    for image in all_images:
        console.print(f"Publishing image {image}...")
        publish_image(source_image_name=image)


def validate_repo_name(repo_name: str) -> None:
    """
    Validate repository name
    """
    if any([a.isspace() for a in repo_name]):
        raise ValueError("Repository name should not contain blank spaces")
    if any([a in repo_name for a in ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "+", "=", "{", "}", "[", "]", ":", ";", "'", '"', "<", ">", "?", "/", "\\", "|", "~", "`"]]):
        raise ValueError("Repository name should not contain special characters")


def organize_pieces_repository(
    build_images: bool,
    source_url: str,
    tag_overwrite: str | None = None,
    dev: bool = False
) -> None:
    """
    Organize Piece's repository for Domino. This will:
    - validate the folder structure, and create the pieces compiled_metadata.json and dependencies_map.json files
    - build Docker images for the Pieces
    - publish images at github container registry
    """
    # Validate repository
    console.print("Validating repository structure and files...")
    validate_repository_structure()
    validate_pieces_folders()
    console.print("Validation successful!", style=f"bold {COLOR_PALETTE.get('success')}")

    # Load config
    with open("config.toml", "rb") as f:
        repo_config = tomli.load(f)

    # Validate repository name
    repo_name = repo_config["repository"]["REPOSITORY_NAME"]
    validate_repo_name(repo_name)

    # Tag overwrite
    if tag_overwrite:
        repo_config["repository"]["VERSION"] = tag_overwrite

    # Create compiled metadata from Pieces metadata.json files and add data input schema
    create_compiled_pieces_metadata(source_url=source_url)

    # Generate dependencies_map.json file
    create_dependencies_map(save_map_as_file=True)
    console.print("Metadata and dependencies organized successfully!", style=f"bold {COLOR_PALETTE.get('success')}")

    # Build and publish the images
    if build_images:
        updated_dependencies_map = build_docker_images(tag_overwrite=tag_overwrite, dev=dev)
        map_file_path = Path(".") / ".domino/dependencies_map.json"
        with open(map_file_path, "w") as outfile:
            json.dump(updated_dependencies_map, outfile, indent=4)


def create_release(tag_name: str | None = None, commit_sha: str | None = None):
    """
    Create a new release and tag in the repository for the latest commit.
    """
    token = os.environ.get('GITHUB_TOKEN', None)
    if not token:
        raise ValueError("GITHUB_TOKEN not found in ENV vars.")
    client = GithubRestClient(token=token)

    # Get version from config.toml
    with open("config.toml", "rb") as f:
        repo_config = tomli.load(f)

    version = repo_config.get("repository", {}).get("VERSION", None)
    if not version:
        raise ValueError("VERSION not found in config.toml")

    # Overwrite version if tag_name is passed
    if tag_name:
        version = tag_name

    # https://docs.github.com/en/actions/learn-github-actions/contexts#example-printing-context-information-to-the-log
    # Passing from context to env - ${{ github.repository }} - get repository from context
    repository = os.environ.get('GITHUB_REPOSITORY', None)
    if not repository:
        raise ValueError("GITHUB_REPOSITORY not found in ENV vars.")

    # Check if tag already exists
    tag = client.get_tag(repo_name=repository, tag_name=version)
    if tag:
        raise ValueError(f'Tag {version} already exists')

    # Get latest commit
    if not commit_sha:
        latest_commit = client.get_commits(repo_name=repository, number_of_commits=1)[0]
        commit_sha = latest_commit.sha
    if not commit_sha:
        raise ValueError("Commit SHA not found")

    # Create tag
    release = client.create_release(
        repo_name=repository,
        version=version,
        tag_message=f'Release {version}',
        release_message=f'Release {version}',
        target_commit_sha=commit_sha,
    )
    console.print(f"Release {version} created successfully!", style=f"bold {COLOR_PALETTE.get('success')}")
    return release


def delete_release(tag_name: str):
    """
    Delete a release with given tag from the repository.
    """
    token = os.environ.get('GITHUB_TOKEN', None)
    if not token:
        raise ValueError("GITHUB_TOKEN not found in ENV vars.")
    client = GithubRestClient(token=token)

    # https://docs.github.com/en/actions/learn-github-actions/contexts#example-printing-context-information-to-the-log
    # Passing from context to env - ${{ github.repository }} - get repository from context
    repository = os.environ.get('GITHUB_REPOSITORY', None)
    if not repository:
        raise ValueError("GITHUB_REPOSITORY not found in ENV vars.")

    # Check if tag already exists
    tag = client.get_tag(repo_name=repository, tag_name=tag_name)
    if tag:
        # Delete release by tag
        client.delete_release_by_tag(repo_name=repository, tag_name=tag_name)
        client.delete_tag(repo_name=repository, tag_name=tag_name)
        console.print(f"Attempting to delete release {tag_name}...", style="bold")
        timeout = 30  # 30 seconds timeout
        start_time = time.time()
        while time.time() - start_time < timeout:
            if not client.get_tag(repo_name=repository, tag_name=tag_name):
                console.print(f"Release {tag_name} deleted successfully!", style=f"bold {COLOR_PALETTE.get('success')}")
                return
            time.sleep(5)  # Wait for 5 seconds before checking again
        console.print(f"Deletion error: Release {tag_name} still exists after {timeout} seconds.", style=f"bold {COLOR_PALETTE.get('warning')}")
    else:
        console.print(f"Release {tag_name} not found. Skipping deletion.", style=f"bold {COLOR_PALETTE.get('warning')}")