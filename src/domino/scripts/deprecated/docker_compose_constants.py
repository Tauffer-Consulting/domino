import copy
import os
from domino.scripts.docker_compose_scripts import init_script


# TODO - UPDATE THIS

# Airflow configuration variables reference:
# https://airflow.apache.org/docs/apache-airflow/stable/configurations-ref.html


# Variables shared by most services
code_repository_source = os.environ.get('CODE_REPOSITORY_SOURCE', 'local')
volume_mount_path_host = os.environ.get('VOLUME_MOUNT_PATH_HOST', './mnt/fs')
volume_mount_path_docker = "/opt/mnt/fs"
code_repository_path_host = os.environ.get('CODE_REPOSITORY_PATH_HOST', '.')
flowui_path_host = os.environ.get('FLOWUI_PATH_HOST', '../flowui')  # used for local dev only
flowui_path_docker = "/opt/flowui"  # used for local dev only

airflow_home_docker = "/opt/mnt/fs/airflow"
airflow_common_env = {
    "VOLUME_MOUNT_PATH_DOCKER": volume_mount_path_docker,
    "VOLUME_MOUNT_PATH_HOST": volume_mount_path_host,
    "AIRFLOW_UID": "${AIRFLOW_UID}",
    "AIRFLOW_HOME": airflow_home_docker,
    "AWS_ACCESS_KEY_ID": "${AWS_ACCESS_KEY_ID}",
    "AWS_SECRET_ACCESS_KEY": "${AWS_SECRET_ACCESS_KEY}",
    "AWS_REGION_NAME": "${AWS_REGION_NAME}",
    "AIRFLOW__CORE__DAGS_FOLDER": f"{airflow_home_docker}/dags",
    "AIRFLOW__CORE__PLUGINS_FOLDER": f"{airflow_home_docker}/plugins",
    "AIRFLOW__LOGGING__BASE_LOG_FOLDER": f"{airflow_home_docker}/logs",
    "AIRFLOW__LOGGING__DAG_PROCESSOR_MANAGER_LOG_LOCATION": f"{airflow_home_docker}/logs/dag_processor_manager/dag_processor_manager.log",
    "AIRFLOW__SCHEDULER__CHILD_PROCESS_LOG_DIRECTORY": f"{airflow_home_docker}/logs/scheduler",
    "AIRFLOW_WEBSERVER_HOST": "http://localhost:8080",
    # Default from original docker-compose.yaml
    "AIRFLOW__CORE__EXECUTOR": "CeleryExecutor",
    "AIRFLOW__CORE__SQL_ALCHEMY_CONN": "postgresql+psycopg2://airflow:airflow@postgres/airflow",
    "AIRFLOW__CELERY__RESULT_BACKEND": "db+postgresql://airflow:airflow@postgres/airflow",
    "AIRFLOW__CELERY__BROKER_URL": "redis://:@redis:6379/0",
    "AIRFLOW__CORE__FERNET_KEY": '',
    "AIRFLOW__CORE__DAGS_ARE_PAUSED_AT_CREATION": 'true',
    "AIRFLOW__CORE__LOAD_EXAMPLES": 'false',
    "AIRFLOW__CORE__ENABLE_XCOM_PICKLING": 'false',
    "AIRFLOW__API__AUTH_BACKEND": 'airflow.api.auth.backend.basic_auth',
    "_PIP_ADDITIONAL_REQUIREMENTS": "${_PIP_ADDITIONAL_REQUIREMENTS:-}",
    "AIRFLOW__SCHEDULER__DAG_DIR_LIST_INTERVAL": 60
}


airflow_common_volumes = [
    # "./mnt/fs:/opt/mnt/fs",
    f"{volume_mount_path_host}:{volume_mount_path_docker}",
]
if code_repository_source == 'local':
    airflow_common_volumes.append(
        f"{code_repository_path_host}:{volume_mount_path_docker}/code_repository"
    )

airflow_common_volumes_dev = [
    f"{volume_mount_path_host}:{volume_mount_path_docker}",
    f"{flowui_path_host}:{flowui_path_docker}",  # for hot-reload on dev
    f"{code_repository_path_host}:{volume_mount_path_docker}/code_repository"
]

airflow_common_depends_on = {
    "redis": {
        "condition": "service_healthy"
    },
    "postgres": {
        "condition": "service_healthy"
    }
}

# Airflow common
x_airflow_common = {
    "image": 'apache/airflow:2.3.3',
    "environment": airflow_common_env,
    "volumes": airflow_common_volumes,
    "user": "${AIRFLOW_UID:-50000}:0",
    "depends_on": airflow_common_depends_on
}

# Airflow common - for internal development
x_airflow_common_dev = {
    "image": 'apache/airflow:2.3.2',
    "environment": airflow_common_env,
    "volumes": airflow_common_volumes_dev,
    "user": "${AIRFLOW_UID:-50000}:0",
    "depends_on": airflow_common_depends_on
}

# Airflow webserver
airflow_webserver = {
    **x_airflow_common,
    "environment": airflow_common_env,
    "container_name": "airflow-webserver",
    "command": "webserver",
    "ports": [
        "8080:8080"
    ],
    "healthcheck": {
        "test":[
            "CMD",
            "curl",
            "--fail",
            "http://localhost:8080/health"
        ],
        "interval": "10s",
        "timeout": "10s",
        "retries": 5
    },
    "restart": "always",
    "depends_on": {
        **airflow_common_depends_on,
        "airflow-init": {
            "condition": "service_completed_successfully"
        }
    }
}

airflow_webserver_dev = copy.deepcopy(airflow_webserver)
airflow_webserver_dev.update({
    'volumes': airflow_common_volumes_dev,
})


# Airflow Redis service
airflow_redis = {
    "image": "redis:latest",
    "container_name": "airflow-redis",
    "expose": [
        6379
    ],
    "healthcheck": {
        "test": [
            "CMD",
            "redis-cli",
            "ping"
        ],
        "interval": "5s",
        "timeout": "30s",
        "retries": 50
    },
    "restart": "always"
}


# Airflow Postgres service
airflow_postgres = {
    "image": "postgres:14",
    "container_name": "postgres-airflow",
    "environment": {
        "POSTGRES_USER": "airflow",
        "POSTGRES_PASSWORD": "airflow",
        "POSTGRES_DB": "airflow"
    },
    "volumes": [
        "postgres-airflow-volume:/var/lib/postgresql/data"
    ],
    "healthcheck": {
        "test": [
            "CMD",
            "pg_isready",
            "-U",
            "airflow"
        ],
        "interval": "5s",
        "retries": 5
    },
    "restart": "always",
    "ports": [
        "5432:5432" # for local tests only
    ]
}


# Airflow Scheduler service
airflow_scheduler = {
    **x_airflow_common,
    "command": 'bash -c "pip install flowui && airflow scheduler"',
    "environment": airflow_common_env,
    "healthcheck": {
        "test": [
            "CMD-SHELL",
            'airflow jobs check --job-type SchedulerJob --hostname "$${HOSTNAME}"'
        ],
        "interval": "10s",
        "timeout": "10s",
        "retries": 5
    },
    "restart": "always",
    "depends_on": {
        **airflow_common_depends_on,
        "airflow-init": {
            "condition": "service_completed_successfully"
        }
    }
}


# Airflow Scheduler service - for internal development
airflow_scheduler_dev = copy.deepcopy(airflow_scheduler)
airflow_scheduler_dev.update({
    "command": f'bash -c "pip install -e {flowui_path_docker} && airflow scheduler"',  # for hot-reload on dev
    "volumes": airflow_common_volumes_dev
})


# Airflow Triggerer service
airflow_triggerer = {
    **x_airflow_common,
    "command": "triggerer",
    "environment": airflow_common_env,
    "healthcheck": {
        "test": [
            "CMD-SHELL",
            'airflow jobs check --job-type TriggererJob --hostname "$${HOSTNAME}"'
        ],
        "interval": "10s",
        "timeout": "10s",
        "retries": 5
    },
    "restart": "always",
    "depends_on": {
        **airflow_common_depends_on,
        "airflow-init": {
            "condition": "service_completed_successfully"
        }
    }
}


# Airflow CLI service
airflow_cli = {
    "profiles": [
        "debug"
    ],
    **x_airflow_common,
    "environment":{
        **airflow_common_env,
        "CONNECTION_CHECK_MAX_COUNT": "0"
    },
    "command": [
        "bash",
        "-c",
        "airflow"
    ]
}


# Airflow Init service
airflow_init = {
    **x_airflow_common,
    "container_name": "airflow-init",
    "entrypoint": "/bin/bash",
    "command": [
        "-c",
        f'{init_script}'
    ],
    "environment": {
        **airflow_common_env,
        "_AIRFLOW_DB_UPGRADE": 'true',
        "_AIRFLOW_WWW_USER_CREATE": 'true',
        "_AIRFLOW_WWW_USER_USERNAME": "${_AIRFLOW_WWW_USER_USERNAME:-airflow}",
        "_AIRFLOW_WWW_USER_PASSWORD": "${_AIRFLOW_WWW_USER_PASSWORD:-airflow}"
    },
    "user": "0:0",
    "volumes": [
        # f"{volume_mount_path_host}/airflow:/sources"
        f"{volume_mount_path_host}/airflow:{airflow_home_docker}"
    ] 
}


# Flower service
flower = {
    **x_airflow_common,
    "command": "celery flower",
    "ports": [
        "5555:5555"
    ],
    "healthcheck":{
        "test": [ "CMD", "curl", "--fail", "http://localhost:5555/" ],
        "interval": "10s",
        "timeout": "10s",
        "retries": 5
    },
    "restart": "always",
    "depends_on": {
        **airflow_common_depends_on,
        "airflow-init": {
            "condition": "service_completed_successfully"
        }
    }
}


# Domino backend service
flowui_backend = {
    "image": "taufferconsulting/flowui-backend:latest",
    "container_name": "flowui-backend",
    "command": 'bash -c "alembic upgrade heads && uvicorn main:app --reload --workers 1 --host 0.0.0.0 --port 8000"',
    "ports": [
        "8000:8000"
    ],
    "environment": [
        "DOMINO_DB_USER=postgres",
        "DOMINO_DB_PASSWORD=postgres",
        "DOMINO_DB_HOST=flowui-postgres",
        "DOMINO_DB_PORT=5432",
        "DOMINO_DB_NAME=postgres",
        "DOMINO_GITHUB_ACCESS_TOKEN_PIECES=${DOMINO_GITHUB_ACCESS_TOKEN_PIECES}",
        "DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS=${DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS}",
        "DOMINO_GITHUB_WORKFLOWS_REPOSITORY=${DOMINO_GITHUB_WORKFLOWS_REPOSITORY}",
        "DOMINO_DEPLOY_MODE=${DOMINO_DEPLOY_MODE}"
    ],
    "networks": [
        "flowui-postgres-network"
    ],
    "volumes": airflow_common_volumes,
    "depends_on": {
        "flowui-postgres": {
            "condition": "service_healthy"
        }
    }
}

# Domino backend service - for internal development
flowui_backend_dev = {
    "build": {
        "context": f"{flowui_path_host}/backend",
        "dockerfile": "Dockerfile"
    },
    "container_name": "flowui-backend-dev",
    "command": 'bash -c "alembic upgrade heads && uvicorn main:app --reload --workers 1 --host 0.0.0.0 --port 8000"',
    "ports": [
        "8000:8000"
    ],
    "environment": [
        "DOMINO_DB_USER=postgres",
        "DOMINO_DB_PASSWORD=postgres",
        "DOMINO_DB_HOST=flowui-postgres",
        "DOMINO_DB_PORT=5432",
        "DOMINO_DB_NAME=postgres",
        "DOMINO_GITHUB_ACCESS_TOKEN_PIECES=${DOMINO_GITHUB_ACCESS_TOKEN_PIECES}",
        "DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS=${DOMINO_GITHUB_ACCESS_TOKEN_WORKFLOWS}",
        "DOMINO_GITHUB_WORKFLOWS_REPOSITORY=${DOMINO_GITHUB_WORKFLOWS_REPOSITORY}",
        "DOMINO_DEPLOY_MODE=${DOMINO_DEPLOY_MODE}"
    ],
    "networks": [
        "flowui-postgres-network"
    ],
    "volumes": airflow_common_volumes_dev + [f"{flowui_path_host}/backend:/backend"],
    "depends_on": {
        "flowui-postgres": {
            "condition": "service_healthy"
        }
    }
}


# Domino Postgres service
flowui_postgres = {
    "image": "postgres",
    "container_name": "flowui-postgres",
    "environment": [
        "POSTGRES_DB=postgres",
        "POSTGRES_USER=postgres",
        "POSTGRES_PASSWORD=postgres"
    ],
    "volumes": [
        "flowui-postgres-volume:/var/lib/postgresql/data"
    ],
    "networks": [
        "flowui-postgres-network"
    ],
    "healthcheck": {
        "test": [
            "CMD-SHELL",
            "pg_isready -d $${POSTGRES_DB} -U $${POSTGRES_USER}"
        ],
        "interval": "10s",
        "timeout": "60s",
        "retries": 5,
        "start_period": "2s"
    },
    "ports": [
        "5433:5432"
    ],
    "restart": "always"
}


# Domino Frontend service
flowui_frontend = {
    "image": "taufferconsulting/flowui-frontend:latest",
    "container_name": "flowui-frontend",
    "command": "yarn start",
    "ports": [
        "3000:3000"
    ]
}

# Domino Frontend service - for internal development
flowui_frontend_dev = {
    "build": {
        "context": "${FLOWUI_PATH_HOST}/frontend",
        "dockerfile": "Dockerfile"
    },
    "container_name": "flowui-frontend",
    "command": "yarn start",
    "ports": [
        "3000:3000"
    ],
    "environment": {
        "FLOWUI_PATH_HOST": "${FLOWUI_PATH_HOST:-../flowui}"
    },
    "volumes": [
        f"{flowui_path_host}/frontend:/frontend",  # For hot-reload on dev
    ]
}
