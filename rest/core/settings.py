from pydantic import BaseSettings, validators
from typing import Optional
import os
from database.models.enums import RepositorySource



def empty_to_none(v: str) -> Optional[str]:
    if v == '':
        return None
    return v


class EmptyStrToNone(str):
    @classmethod
    def __get_validators__(cls):
        yield validators.str_validator
        yield empty_to_none


class Settings(BaseSettings):
    # General app config
    VERSION = "0.1.0"
    APP_TITLE = "Domino REST api"

    # Database config
    DB_URL = 'postgresql://{user}:{password}@{host}:{port}/{name}'.format(
        user=os.environ.get("DOMINO_DB_USER", "postgres"),
        password=os.environ.get("DOMINO_DB_PASSWORD", "postgres"),
        host=os.environ.get("DOMINO_DB_HOST", "localhost"),
        port=os.environ.get("DOMINO_DB_PORT", "5432"),
        name=os.environ.get("DOMINO_DB_NAME", "postgres"),
    )
    
    # Auth config
    AUTH_SECRET_KEY = os.environ.get('AUTH_SECRET_KEY', "SECRET")
    AUTH_ALGORITHM = os.environ.get('AUTH_ALGORITHM', "HS256")
    AUTH_ACCESS_TOKEN_EXPIRE_MINUTES = 600

    # Secrets config
    SECRETS_SECRET_KEY = os.environ.get('SECRETS_SECRET_KEY', b'j1DsRJ-ehxU_3PbXW0c_-U4nTOx3knRB4zzWguMVaio=')
    GITHUB_TOKEN_SECRET_KEY = os.environ.get('GITHUB_TOKEN_SECRET_KEY', b'j1DsRJ-ehxU_3PbXW0c_-U4nTOx3knRB4zzWguMVaio=')

    # Used by github rest client
    DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS = os.environ.get('DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS', '')

    # Workflows storage
    DOMINO_GITHUB_WORKFLOWS_REPOSITORY = os.environ.get('DOMINO_GITHUB_WORKFLOWS_REPOSITORY', "Tauffer-Consulting/domino_workflows_dev")
    DOMINO_LOCAL_WORKFLOWS_REPOSITORY = '/opt/airflow/dags'

    # Default domino pieces repository
    DOMINO_DEFAULT_PIECES_REPOSITORY = os.environ.get('DOMINO_DEFAULT_PIECES_REPOSITORY', "Tauffer-Consulting/default_domino_pieces")
    DOMINO_DEFAULT_PIECES_REPOSITORY_VERSION = os.environ.get('DOMINO_DEFAULT_PIECES_REPOSITORY_VERSION', "0.3.14")
    DOMINO_DEFAULT_PIECES_REPOSITORY_SOURCE = os.environ.get('DOMINO_DEFAULT_PIECES_REPOSITORY_SOURCE', "github")
    DOMINO_DEFAULT_PIECES_REPOSITORY_TOKEN: EmptyStrToNone = os.environ.get('DOMINO_DEFAULT_PIECES_REPOSITORY_TOKEN', "")
    DOMINO_DEFAULT_PIECES_REPOSITORY_URL: str = os.environ.get('DOMINO_DEFAULT_PIECES_REPOSITORY_URL', 'https://github.com/Tauffer-Consulting/default_domino_pieces')
    
    # Default DB mock data
    RUN_CREATE_MOCK_DATA = False
    ADMIN_CREDENTIALS = {
        "email": "admin@email.com",
        "password": "admin"
    }
    AIRFLOW_ADMIN_CREDENTIALS = {
        "username": os.environ.get('AIRFLOW_ADMIN_USERNAME', "admin"),
        "password": os.environ.get('AIRFLOW_ADMIN_PASSWORD', "admin")
    }
    AIRFLOW_WEBSERVER_HOST = os.environ.get('AIRFLOW_WEBSERVER_HOST', "http://airflow-webserver:8080/")

    # Default repositories
    DEFAULT_STORAGE_REPOSITORY = dict(
        name="default_storage_repository",
        path="default_storage_repository",
        source=getattr(RepositorySource, 'default').value,
        version="0.0.1",
        url="domino-default/default_storage_repository"
    )

    DEPLOY_MODE = os.environ.get('DOMINO_DEPLOY_MODE', 'local-k8s')

    CONDITIONAL_ENDPOINTS_ENABLED = False if DEPLOY_MODE == 'local-compose' else True

class LocalK8sSettings(Settings):
    SERVER_HOST = "0.0.0.0"
    DEBUG = True
    PORT = 8000
    RELOAD = True
    CORS = {
        "origins": [
            "*",
        ],
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }
    ROOT_PATH = '/api'


class LocalComposeSettings(Settings):
    SERVER_HOST = "0.0.0.0"
    DEBUG = True
    PORT = 8000
    RELOAD = True
    CORS = {
        "origins": [
            "*",
        ],
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }

    ROOT_PATH = '/'


class ProdSettings(Settings):
    SERVER_HOST = "0.0.0.0"
    DEBUG = False
    PORT = 8000
    RELOAD = False
    CORS = {
        "origins": [
            "*",
        ],
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }

    # ROOT_PATH is based in proxy config. Must be the same as the path to the api in the proxy
    ROOT_PATH = '/api'


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