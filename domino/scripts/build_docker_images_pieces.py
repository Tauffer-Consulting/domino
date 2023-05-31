from pathlib import Path
import docker
import tomli
import json
import shutil
import os
from colorama import Fore, Style
from rich.console import Console

console = Console()

def build_and_publish_from_tmp_dockerfile(source_image_name: str, publish: bool, path: str = ".", dockerfile: str = "Dockerfile-tmp"):
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
        if publish:
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
        print(Style.RESET_ALL)
    except Exception as e:
        raise Exception(e)
    finally:
        (Path(path) / dockerfile).unlink()


def build_images_from_pieces_repository(publish: bool = False):
    """
    Each dependencies group will need to have its own Docker image built and published to be used by Domino.
    This is because the Pieces source code goes baked in the images.
    """

    dependencies_path = Path(".") / "dependencies"
    domino_path = Path(".") / ".domino"
    config_path = Path(".") / "config.toml"

    # Get information from config.toml file
    with open(config_path, "rb") as f:
        config_dict = tomli.load(f)
    docker_image_repository = config_dict.get("repository").get("REPOSITORY_NAME")
    docker_image_version = config_dict.get("repository").get("VERSION")

    if publish:
        github_container_registry_name = f'ghcr.io/{config_dict.get("repository").get("REGISTRY_NAME")}'.lower()
    else:
        github_container_registry_name = f'local'

    # Load dependencies_map.json file
    with open(domino_path / "dependencies_map.json", "r") as f:
        pieces_dependencies_map = json.load(f)

    # Build docker images from unique definitions
    for group, v in pieces_dependencies_map.items():
        dependency_dockerfile = v["dependency"].get("dockerfile", None)
        dependency_requirements = v["dependency"].get("requirements_file", None)
        source_image_name = f"{github_container_registry_name}/{docker_image_repository}:{docker_image_version}-{group}"

        # If no extra dependency, use base Pod image and just copy the Pieces source code
        if not any([dependency_dockerfile, dependency_requirements]):
            pieces_dependencies_map[group]["source_image"] = source_image_name
            # TODO change base image to domino when we have it
            dockerfile_str = f"""FROM ghcr.io/tauffer-consulting/domino-airflow-pod:latest
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
            # TODO change base image to domino when we have it
            dockerfile_str = f"""FROM ghcr.io/tauffer-consulting/domino-airflow-pod:latest
COPY config.toml domino/pieces_repository/
COPY pieces domino/pieces_repository/pieces
COPY .domino domino/pieces_repository/.domino
COPY dependencies/{dependency_requirements} domino/pieces_repository/dependencies/
RUN pip install --no-cache-dir -r domino/pieces_repository/dependencies/{dependency_requirements}
"""
            with open("Dockerfile-tmp", "w") as f:
                f.write(dockerfile_str)

        build_and_publish_from_tmp_dockerfile(
            source_image_name=source_image_name, 
            publish=publish
        )
    
    return pieces_dependencies_map


def build_worker_image_from_pieces_repositories(repositories_urls: list, publish: bool = False):
    """
    Build a Worker image that will be used when running locally with docker compose.
    """
    # pip install GitPython
    # TODO move to top
    from git import Repo
    import tempfile

    all_metadata = {}
    all_requirements = []
    # tmp dir in the current directory
    with tempfile.TemporaryDirectory(dir='.') as tmpdirname:
        for repository_url in repositories_urls:
            repo_name = repository_url.split("/")[-1].split(".")[0]
            path_name = Path(tmpdirname) / repo_name
            Repo.clone_from(url=repository_url, to_path=path_name)

            # Copy all Pieces folders to a tmp pieces folder - only if it doesn't require a Dockerfile
            for p in (path_name / "pieces").glob("*"):
                if not p.is_dir():
                    continue

                with open(p / 'metadata.json') as f:
                    metadata = json.load(f)
                dependencies = metadata.get("dependency", None)
                if dependencies and dependencies.get("dockerfile", None) is not None:
                    print(f"Piece {p.name} requires a Dockerfile to be built. Skipping it.")
                    continue

                shutil.copytree(
                    p,
                    Path(tmpdirname) / 'pieces' / p.name
                    #Path('./pieces') / p.name
                )
                # Open each requirements file and append its contents to the all_requirements list
                if dependencies and dependencies.get("requirements_file", None) is not None:
                    req_file_name = metadata.get("dependency").get("requirements_file")
                    req_file_path = (p.parent.parent / "dependencies" / req_file_name).resolve()
                    with open(req_file_path) as f:
                        all_requirements += f.readlines() 
                all_metadata[p.name] = metadata
                all_requirements += ["\n"]

        all_requirements = list(set(all_requirements))
        # Write compiled_metadata.json file
        compiled_path = Path(tmpdirname) / "compiled_metadata.json"
        with open(compiled_path, "w") as f:
            json.dump(all_metadata, f, indent=4)
        
        # Write the combined requirements to a new file
        requirements_path = Path(tmpdirname) / "all_requirements.txt"
        with open(requirements_path, 'w') as f:
            f.writelines(all_requirements)
        
        # Write local Dockerfile
        dockerfile_str = f"""FROM apache/airflow:2.5.3-python3.9
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
USER root
RUN apt-get update
RUN /usr/local/bin/python -m pip install --upgrade pip

RUN mkdir -p /home/domino/pieces_repository/pieces
COPY pieces /home/domino/pieces_repository/pieces

RUN mkdir -p /home/domino/pieces_repository/.domino
COPY compiled_metadata.json /home/domino/pieces_repository/.domino/compiled_metadata.json

RUN mkdir -p /home/domino/pieces_repository/dependencies
COPY all_requirements.txt /home/domino/pieces_repository/dependencies/all_requirements.txt

RUN mkdir -p /home/run_data
WORKDIR /home/run_data
RUN chmod -R 777 .

WORKDIR /home/domino
RUN /usr/local/bin/python -m venv venv_domino \
    && source venv_domino/bin/activate \
    && pip install domino-py \
    && pip install --no-cache-dir -r domino/pieces_repository/dependencies/all_requirements.txt
"""
        dockerfile_path = Path(tmpdirname) / "Dockerfile-tmp"
        with open(dockerfile_path, "w") as f:
            f.write(dockerfile_str)

        # Build and publish
        build_and_publish_from_tmp_dockerfile(
            source_image_name="domino-airflow-worker-compose:latest",
            publish=publish,
            path=tmpdirname,
            dockerfile="Dockerfile-tmp"
        )


# TODO remove
if __name__ == '__main__':
    repos = [
        "https://github.com/Tauffer-Consulting/social_media_domino_pieces", 
        "https://github.com/Tauffer-Consulting/openai_domino_pieces"
    ]
    build_worker_image_from_pieces_repositories(repos)