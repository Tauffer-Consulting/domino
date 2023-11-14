from pydantic_settings import BaseSettings
from typing import Union
import os
from database.models.enums import RepositorySource



class Settings(BaseSettings):
    # General app config
    VERSION: str = "0.1.0"
    APP_TITLE: str = "Domino REST api"

    # Database config
    DB_URL: str = 'postgresql://{user}:{password}@{host}:{port}/{name}'.format(
        user=os.environ.get("DOMINO_DB_USER", "postgres"),
        password=os.environ.get("DOMINO_DB_PASSWORD", "postgres"),
        host=os.environ.get("DOMINO_DB_HOST", "localhost"),
        port=os.environ.get("DOMINO_DB_PORT", "5432"),
        name=os.environ.get("DOMINO_DB_NAME", "postgres"),
    )

    # Auth config
    AUTH_SECRET_KEY: str = os.environ.get('AUTH_SECRET_KEY', "SECRET")
    AUTH_ALGORITHM: str = os.environ.get('AUTH_ALGORITHM', "HS256")
    AUTH_ACCESS_TOKEN_EXPIRE_MINUTES: int = 600

    # Secrets config
    SECRETS_SECRET_KEY: str = os.environ.get('SECRETS_SECRET_KEY', b'j1DsRJ-ehxU_3PbXW0c_-U4nTOx3knRB4zzWguMVaio=')
    GITHUB_TOKEN_SECRET_KEY: str = os.environ.get('GITHUB_TOKEN_SECRET_KEY', b'j1DsRJ-ehxU_3PbXW0c_-U4nTOx3knRB4zzWguMVaio=')

    # Used by github rest client
    DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS: str | None = os.environ.get('DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS', None)

    # Workflows storage
    DOMINO_GITHUB_WORKFLOWS_REPOSITORY: str = os.environ.get('DOMINO_GITHUB_WORKFLOWS_REPOSITORY', "Tauffer-Consulting/domino_workflows_dev")
    DOMINO_LOCAL_WORKFLOWS_REPOSITORY: str = '/opt/airflow/dags'

    # Default domino pieces repository
    DOMINO_DEFAULT_PIECES_REPOSITORY: str = os.environ.get('DOMINO_DEFAULT_PIECES_REPOSITORY', "Tauffer-Consulting/default_domino_pieces")
    DOMINO_DEFAULT_PIECES_REPOSITORY_VERSION: str = os.environ.get('DOMINO_DEFAULT_PIECES_REPOSITORY_VERSION', "0.6.0")
    DOMINO_DEFAULT_PIECES_REPOSITORY_SOURCE: str = os.environ.get('DOMINO_DEFAULT_PIECES_REPOSITORY_SOURCE', "github")
    DOMINO_DEFAULT_PIECES_REPOSITORY_TOKEN: str | None = os.environ.get('DOMINO_DEFAULT_PIECES_REPOSITORY_TOKEN', None)
    DOMINO_DEFAULT_PIECES_REPOSITORY_URL: str = os.environ.get('DOMINO_DEFAULT_PIECES_REPOSITORY_URL', 'https://github.com/Tauffer-Consulting/default_domino_pieces')

    # Default DB mock data
    RUN_CREATE_MOCK_DATA: bool = False
    ADMIN_CREDENTIALS: dict = {
        "email": "admin@email.com",
        "password": "admin"
    }
    AIRFLOW_ADMIN_CREDENTIALS: dict = {
        "username": os.environ.get('AIRFLOW_ADMIN_USERNAME', "admin"),
        "password": os.environ.get('AIRFLOW_ADMIN_PASSWORD', "admin")
    }
    AIRFLOW_WEBSERVER_HOST: str = os.environ.get('AIRFLOW_WEBSERVER_HOST', "http://airflow-webserver:8080/")

    # Default repositories
    DEFAULT_STORAGE_REPOSITORY: dict = dict(
        name="default_storage_repository",
        path="default_storage_repository",
        source=getattr(RepositorySource, 'default').value,
        version="0.0.1",
        url="domino-default/default_storage_repository"
    )

    DEPLOY_MODE: str = os.environ.get('DOMINO_DEPLOY_MODE', 'local-k8s')

    CONDITIONAL_ENDPOINTS_ENABLED: bool = False if DEPLOY_MODE == 'local-compose' else True


class LocalK8sSettings(Settings):
    SERVER_HOST: str = "0.0.0.0"
    DEBUG: bool = True
    PORT: int = 8000
    RELOAD: bool = True
    CORS: dict = {
        "origins": [
            "*",
        ],
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }
    ROOT_PATH: str = '/api'


class LocalComposeSettings(Settings):
    SERVER_HOST: str = "0.0.0.0"
    DEBUG: bool = True
    PORT: int = 8000
    RELOAD: bool = True
    CORS: dict = {
        "origins": [
            "*",
        ],
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }

    ROOT_PATH: str = '/'


class ProdSettings(Settings):
    SERVER_HOST: str = "0.0.0.0"
    DEBUG: bool = False
    PORT: int = 8000
    RELOAD: bool = False
    CORS: dict = {
        "origins": [
            "*",
        ],
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }

    # ROOT_PATH is based in proxy config. Must be the same as the path to the api in the proxy
    ROOT_PATH: str = '/api'


def get_settings():
    env = os.getenv("DOMINO_DEPLOY_MODE", "local-k8s-dev")
    settings_type = {
        "local-k8s": LocalK8sSettings(),
        "local-k8s-dev": LocalK8sSettings(),
        "local-compose": LocalComposeSettings(),
        "prod": ProdSettings(),
    }
    return settings_type[env]


settings: Settings = get_settings()
