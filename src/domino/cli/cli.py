from rich.console import Console
from pathlib import Path
import click
import os
import uuid

from domino.cli.utils import pieces_repository, platform
import ast

console = Console()

# Ref: https://patorjk.com/software/taag/
# Font: standard
msg = """
==============================================
  ____                  _             
 |  _ \  ___  _ __ ___ (_)_ __   ___  
 | | | |/ _ \| '_ ` _ \| | '_ \ / _ \ 
 | |_| | (_) | | | | | | | | | | (_) |
 |____/ \___/|_| |_| |_|_|_| |_|\___/       
  
=============================================="""


###############################################################################
# DOMINO PLATFORM
###############################################################################

def validate_github_token_workflows(value):
    if value and value.startswith("ghp_"):
        return value
    return None


def validate_github_token(value):
    if value and value.startswith("ghp_"):
        return value
    return None


def get_cluster_name_from_env():
    cluster_name = os.environ.get("DOMINO_KIND_CLUSTER_NAME", None)
    if not cluster_name:
        cluster_name = "domino-cluster"
    return cluster_name


def get_github_workflows_ssh_private_key_from_env():
    return os.environ.get("DOMINO_GITHUB_WORKFLOWS_SSH_PRIVATE_KEY", "")

def get_github_token_pieces_from_env():
    return os.environ.get("DOMINO_DEFAULT_PIECES_REPOSITORY_TOKEN", None)

def get_github_token_workflows_from_env():
    return os.environ.get("DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS", None)

def get_workflows_repository_from_env():
    return os.environ.get("DOMINO_GITHUB_WORKFLOWS_REPOSITORY", None)

def get_registry_token_from_env():
    return os.environ.get('GHCR_PASSWORD', "")

@click.command()
@click.option(
    '--cluster-name', 
    prompt='Local cluster name', 
    default=get_cluster_name_from_env,
    help='Define the name for the local k8s cluster.'
)
@click.option(
    '--workflows-repository',
    prompt='Workflows repository',
    default=get_workflows_repository_from_env,
    help='Github repository where the Domino workflows will be stored.'
)
@click.option(
    '--github-workflows-ssh-private-key', 
    prompt='Github ssh private for Workflows repository. If none, it will create a ssh key pair to be used.',
    default=get_github_workflows_ssh_private_key_from_env,
    help='Github ssh key for GitSync read/write operations on Workflows repository. The private key will be used in the Domino cluster and the public key should be added to the Github repository deploy keys.'
)
@click.option(
    '--github-default-pieces-repository-token',
    prompt='Github token for Pieces repository',
    default=get_github_token_pieces_from_env,
    help='Github token for read operations on Pieces repositories.'
)
@click.option(
    '--github-workflows-token', 
    prompt='Github token for Workflows Repository',
    default=get_github_token_workflows_from_env,
    help='Github token for read/write operations on Workflows Repository.'
)
@click.option(
    '--deploy-mode',
    prompt='Deploy mode',
    default="local-k8s",
    help='Deploy mode - either "local" or "remote".'
)
@click.option(
    '--local-pieces-repository-path',
    prompt='Local pieces repository path. Example: ["/path/to/repo1", "/path/to/"repo2"]',
    default=[],
    help='List of local pieces repository paths.',
)
@click.option(
    "--local-domino-path",
    prompt="Local Domino path",
    default="",
    help="Local Domino path. It is used only if dev-mode is set to 'local' and it will allow you to use hot reloading for local Domino.",
)
@click.option(
    '--local-rest-image',
    prompt='Local Domino REST image to use if local-k8s-dev deploy mode.',
    default="",
    help='Local Domino REST image to use if local-k8s-dev deploy mode.',
)
@click.option(
    '--local-frontend-image',
    prompt='Local Domino Front image to use if local-k8s-dev deploy mode.',
    default="",
    help='Local Domino Front image to use if local-k8s-dev deploy mode.',
)
@click.option(
    '--local-airflow-image',
    prompt='Local Domino Airflow image to use if local-k8s-dev deploy mode.',
    default="",
    help='Local Domino Airflow image to use if local-k8s-dev deploy mode.',
)
def cli_prepare_platform(
    cluster_name,
    workflows_repository,
    github_workflows_ssh_private_key,
    github_default_pieces_repository_token,
    github_workflows_token,
    deploy_mode,
    local_pieces_repository_path,
    local_domino_path,
    local_rest_image,
    local_frontend_image,
    local_airflow_image

):
    """Prepare local folder for running a Domino platform."""
    platform.prepare_platform(
        cluster_name=cluster_name, 
        workflows_repository=workflows_repository,
        github_workflows_ssh_private_key=github_workflows_ssh_private_key, 
        github_default_pieces_repository_token=github_default_pieces_repository_token,
        github_workflows_token=github_workflows_token,
        deploy_mode=deploy_mode,
        local_pieces_repository_path=ast.literal_eval(local_pieces_repository_path),
        local_domino_path=local_domino_path,
        local_rest_image=local_rest_image,
        local_frontend_image=local_frontend_image,
        local_airflow_image=local_airflow_image
    )


@click.command()
@click.option(
    "--install-airflow", 
    default=True,
    help="Install Airflow services."
)
@click.option(
    "--use-gpu",
    is_flag=True,
    # Nvidia operator plugin reference: https://catalog.ngc.nvidia.com/orgs/nvidia/containers/gpu-operator
    help="Allow the platform to use GPUs. It will install NVIDIA plugins.",
    default=False
)
def cli_create_platform(install_airflow, use_gpu):
    """Create cluster, install services and run Domino platform."""
    platform.create_platform(install_airflow, use_gpu)


@click.command()
def cli_destroy_platform():
    """Destroy Kind cluster."""
    platform.destroy_platform()


@click.command()
@click.option(
    "--d",
    is_flag=True,
    help="Run in detached mode.",
    default=False
)
@click.option(
    '--use-config-file',
    is_flag=True,
    help="Use config file to run platform.",
    default=False
)
@click.option(
    '--dev',
    is_flag=True,
    help="Run platform in dev mode.",
    default=False
)
@click.option(
    '--stop',
    is_flag=True,
    help="Stop and remove containers.",
    default=False
)
def cli_run_platform_compose(d, use_config_file, dev, stop):
    """Run Domino platform locally with docker compose. Do NOT use this in production."""
    if stop:
        platform.stop_platform_compose()
    else:
        platform.run_platform_compose(detached=d, use_config_file=use_config_file, dev=dev)


@click.group()
@click.pass_context
def cli_platform(ctx):
    """Domino platform actions"""
    if ctx.invoked_subcommand == "prepare":
        console.print("Let's get you started configuring a local Domino platform:")
    elif ctx.invoked_subcommand == "create":
        console.print("Your local Domino platform is being created. This might take a while...")    


cli_platform.add_command(cli_prepare_platform, name="prepare")
cli_platform.add_command(cli_create_platform, name="create")
cli_platform.add_command(cli_destroy_platform, name="destroy")
cli_platform.add_command(cli_run_platform_compose, name="run-compose")


###############################################################################
# PIECES REPOSITORY 
###############################################################################

def generate_random_repo_name():
    return f"new_repository_{str(uuid.uuid4())[0:8]}"


@click.command()
@click.option(
    '--name', 
    prompt="Repository's name",
    default=generate_random_repo_name,
    help="Repository's name"
)
@click.option(
    '--container-registry', 
    prompt="Github Container Registry name",
    default="",
    help="Github container registry name"
)
def cli_create_piece_repository(name, container_registry):
    """Create a basic Pieces repository with placeholder files."""
    pieces_repository.create_pieces_repository(repository_name=name, container_registry=container_registry)


@click.command()
@click.option(
    '--build-images', 
    is_flag=True,
    prompt='Build Docker images?',
    expose_value=True,
    default=False,
    help='If True (default), builds Docker images.'
)
@click.option(
    '--source-url',
    prompt='Url of source repository',
    default="",
    help='The base url for this Pieces repository.'
)
def cli_organize_pieces_repository(build_images, source_url):
    """Organize Pieces repository."""
    pieces_repository.organize_pieces_repository(build_images, source_url)

@click.command()
@click.option(
    '--registry-token',
    prompt='Github Container Registry token',
    default=get_registry_token_from_env,
    help='Your Github Container Registry token with access to where the image will be published.'
)
def cli_publish_images(registry_token):
    """Publish images to github container registry from mapping."""
    if registry_token:
        os.environ['GHCR_PASSWORD'] = registry_token
    console.print(f"Using registry token to publish images")
    pieces_repository.publish_docker_images()
    
@click.command()
def cli_create_release():
    """
    Get release version for the Pieces repository in github stdout format.
    Used by github actions to set the release version.
    Needs the following env vars:
        - GITHUB_TOKEN
        - GITHUB_REPOSITORY
    """
    pieces_repository.create_release()
    

@click.group()
@click.pass_context
def cli_piece(ctx):
    """Pieces repository actions"""
    if ctx.invoked_subcommand == "organize":
        console.print(f"Organizing Pieces Repository at: {Path('.').resolve()}")
    elif ctx.invoked_subcommand == "create":
        pass


cli_piece.add_command(cli_organize_pieces_repository, name="organize")
cli_piece.add_command(cli_create_piece_repository, name="create")
cli_piece.add_command(cli_create_release, name="release")
cli_piece.add_command(cli_publish_images, name="publish-images")


###############################################################################
# PARENT GROUP
###############################################################################

@click.command()
def cli_run_piece_k8s():
    """Run Piece on Kubernetes Pod"""
    from domino.scripts.run_piece_docker import run_piece as run_piece_in_docker    
    console.print("Running Piece inside K8s pod...")
    run_piece_in_docker()


@click.command()
def cli_run_piece_docker():
    """Run Piece on Docker container"""
    from domino.scripts.run_piece_docker import run_piece as run_piece_in_docker
    console.print('Running Piece inside Docker container...')
    run_piece_in_docker()


###############################################################################
# PARENT GROUP
###############################################################################

@click.group()
@click.pass_context
def cli(ctx):
    console.print(msg, style="rgb(109,125,176)", highlight=False)
    console.print("Welcome to Domino! :red_heart-emoji:")
    console.print("")


cli.add_command(cli_platform, name="platform")
cli.add_command(cli_piece, name="piece")
cli.add_command(cli_run_piece_k8s, name="run-piece-k8s")
cli.add_command(cli_run_piece_docker, name='run-piece-docker')


if __name__ == '__main__':
    cli()
