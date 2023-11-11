from pathlib import Path
import docker
import tomli
import json
import shutil
import os
from colorama import Fore, Style
from rich.console import Console


console = Console()


def publish_image(source_image_name: str):
    client = docker.from_env()
    print(f"Publishing docker image: {source_image_name}")
    print(Style.RESET_ALL + Style.DIM, end='')
    try:
        registry_url = 'https://ghcr.io'
        ghcr_username = os.environ.get("GHCR_USERNAME", None)
        ghcr_password = os.environ.get("GHCR_PASSWORD", None)
        client.login(username=ghcr_username, password=ghcr_password, registry=registry_url)
    except docker.errors.APIError:
        console.print("Unauthorized login")
        raise
    response = client.images.push(repository=source_image_name)
    print(response, end='')
    print(Style.RESET_ALL + Fore.BLUE + f"Finished publishing: {source_image_name}")


def build_image_from_tmp_dockerfile(
    source_image_name: str,
    path: str = ".",
    dockerfile: str = "Dockerfile-tmp"
):
    client = docker.from_env()
    try:
        os.environ["DOCKER_BUILDKIT"] = "1"
        print(Fore.BLUE + f"Building docker image: {source_image_name}")
        build_results = client.images.build(
            path=path,
            dockerfile=dockerfile,
            tag=source_image_name,
            nocache=True,
            forcerm=True
        )
        print(Style.RESET_ALL + Style.DIM, end='')
        for r in build_results[1]:
            if "stream" in r and r["stream"] != "\n":
                print(r)
        print(Style.RESET_ALL + Fore.BLUE + f"Finished building: {source_image_name}")
        print(Style.RESET_ALL)
    except Exception as e:
        raise Exception(e)
    finally:
        (Path(path) / dockerfile).unlink()


def build_images_from_pieces_repository(tag_overwrite: str | None = None):
    """
    Each dependencies group will need to have its own Docker image built and published to be used by Domino.
    This is because the Pieces source code goes baked in the images.
    """
    dependencies_path = Path(".") / "dependencies"
    domino_path = Path(".") / ".domino"
    config_path = Path(".") / "config.toml"

    # Get information from config.toml file
    with open(config_path, "rb") as f:
        repo_config = tomli.load(f).get("repository", {})

    # Tag overwrite
    if tag_overwrite:
        repo_config["VERSION"] = tag_overwrite

    docker_image_repository = repo_config.get("REPOSITORY_NAME")
    docker_image_version = repo_config.get("VERSION")
    github_container_registry_name = f'ghcr.io/{repo_config.get("REGISTRY_NAME")}'.lower()

    # Load dependencies_map.json file
    with open(domino_path / "dependencies_map.json", "r") as f:
        pieces_dependencies_map = json.load(f)

    pieces_images_map = {}
    # Build docker images from unique definitions
    for group, v in pieces_dependencies_map.items():
        dependency_dockerfile = v["dependency"].get("dockerfile", None)
        dependency_requirements = v["dependency"].get("requirements_file", None)
        source_image_name = f"{github_container_registry_name}/{docker_image_repository}:{docker_image_version}-{group}"

        # If no extra dependency, use base Pod image and just copy the Pieces source code
        if not any([dependency_dockerfile, dependency_requirements]):
            pieces_dependencies_map[group]["source_image"] = source_image_name
            dockerfile_str = """FROM ghcr.io/tauffer-consulting/domino-base-piece:latest
COPY config.toml domino/pieces_repository/
COPY pieces domino/pieces_repository/pieces
COPY .domino domino/pieces_repository/.domino
"""
            with open("Dockerfile-tmp", "w") as f:
                f.write(dockerfile_str)

        # If dependency is defined as a Dockerfile, copy it to root path and run build/publish
        elif dependency_dockerfile:
            pieces_dependencies_map[group]["source_image"] = source_image_name
            build_dockerfile_path = str(dependencies_path.resolve() / dependency_dockerfile)
            shutil.copyfile(build_dockerfile_path, "Dockerfile-tmp")

        # If dependency is defined as a requirements.txt
        elif dependency_requirements:
            pieces_dependencies_map[group]["source_image"] = source_image_name
            dockerfile_str = f"""FROM ghcr.io/tauffer-consulting/domino-base-piece:latest
COPY config.toml domino/pieces_repository/
COPY pieces domino/pieces_repository/pieces
COPY .domino domino/pieces_repository/.domino
COPY dependencies/{dependency_requirements} domino/pieces_repository/dependencies/
RUN pip install --no-cache-dir -r domino/pieces_repository/dependencies/{dependency_requirements}
"""
            with open("Dockerfile-tmp", "w") as f:
                f.write(dockerfile_str)

        for piece_name in v.get('pieces'):
            pieces_images_map[piece_name] = source_image_name

        build_image_from_tmp_dockerfile(source_image_name=source_image_name)

    var_value = json.dumps(pieces_images_map)
    os.environ["PIECES_IMAGES_MAP"] = var_value
    env_file = os.getenv('GITHUB_ENV')
    if env_file:
        with open(env_file, "a") as f:
            f.write(f"PIECES_IMAGES_MAP={var_value}")
    return pieces_dependencies_map
