import yaml
import json
import os
from pathlib import Path


# TODO - UPDATE THIS


class MyDumper(yaml.SafeDumper):
    def write_line_break(self, data=None):
        """
        Insert blank lines between top-level objects
        From here: https://github.com/yaml/pyyaml/issues/127#issuecomment-525800484
        inspired by https://stackoverflow.com/a/44284819/3786245
        """
        super().write_line_break(data)
        if len(self.indents) == 1:
            super().write_line_break()
        elif len(self.indents) == 2:
            super().write_line_break()

    def ignore_aliases(self, data):
        return True
    
    def increase_indent(self, flow=False, indentless=False):
        """
        Proper indentation of lists
        From here: https://stackoverflow.com/a/39681672/11483674
        """
        return super(MyDumper, self).increase_indent(flow, False)

    @staticmethod
    def str_presenter(dumper, data):
        """
        Configures yaml for dumping multiline strings
        Ref: https://stackoverflow.com/questions/8640959/how-can-i-control-what-scalar-form-pyyaml-uses-for-my-data
        """
        if len(data.splitlines()) > 1:  # check for multiline string
            return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='|')
        return dumper.represent_scalar('tag:yaml.org,2002:str', data)


yaml.add_representer(str, MyDumper.str_presenter)
yaml.representer.SafeRepresenter.add_representer(str, MyDumper.str_presenter)


def create_dependencies_services(dependencies_map: dict, run_scope: str):
    default_image = "taufferconsulting/flowui-airflow-base-worker"

    # This needs to run only after ENV vars have been set
    from domino.scripts.docker_compose_constants import (
        x_airflow_common,
        airflow_common_env,
        airflow_common_depends_on,
        x_airflow_common_dev
    )

    command_def = {
        "deploy-local": 'bash -c "pip install flowui && airflow celery worker --autoscale 1 --queues {dependency_name}"',
        "deploy-local-dev": 'bash -c "pip install -e /opt/flowui && airflow celery worker --autoscale 1 --queues {dependency_name}"'
    }

    x_airflow_common_def = {
        "deploy-local": x_airflow_common,
        "deploy-local-dev": x_airflow_common_dev,
    }

    services = dict()
    for dependency_name, dependency_info in dependencies_map.items():
        environment_secrets = {i:f"${{{i}:-}}" for i in dependency_info.get("secrets", list())}
        services[f'airflow-{dependency_name}'] = {
            **x_airflow_common_def[run_scope],
            "image": dependency_info.get("source_image", default_image),
            "container_name": dependency_name,
            "command": command_def.get(run_scope).format(dependency_name=dependency_name), #f'bash -c "pip install -e ./flowui/ && airflow celery worker --autoscale 1 --queues {dependency_name}"',
            "healthcheck": {
                "test": [
                    "CMD-SHELL",
                    'celery --app airflow.executors.celery_executor.app inspect ping -d "celery@$${HOSTNAME}"'
                ],
                "interval": "10s",
                "timeout": "10s",
                "retries": 5
            },
            "environment": {
                **airflow_common_env,
                **environment_secrets,
                "DUMB_INIT_SETSID": "0"
            },
            "restart": "always",
            "depends_on": {
                **airflow_common_depends_on,
                "airflow-init": {
                    "condition": "service_completed_successfully"
                }
            }
        }

    return services


# TODO change dependencies_map_path to be based on the mnt directory defined in config.ini
def create_docker_compose_file(
    dependencies_map: dict = None,
    run_scope: str = "deploy-local",
    output_file_path: str = "docker-compose.yaml",
    include_airflow_cli: bool = False,
    include_airflow_triggerer: bool = False,
    include_flower: bool = False,
    include_flowui_backend: bool = True,
    include_flowui_frontend: bool = False
):
    # This needs to run only after ENV vars have been set
    from domino.scripts.docker_compose_constants import (
        airflow_postgres,
        airflow_redis,
        airflow_scheduler,
        airflow_triggerer,
        airflow_webserver,
        airflow_webserver_dev,
        airflow_cli,
        airflow_init,
        flower,
        flowui_backend,
        flowui_postgres,
        flowui_frontend,
        flowui_backend_dev,
        flowui_frontend_dev,
        airflow_scheduler_dev
    )

    dependencies_services = create_dependencies_services(
        dependencies_map=dependencies_map,
        run_scope=run_scope,
    )

    # Services
    scheduler_def = {
        "deploy-local": airflow_scheduler,
        "deploy-local-dev": airflow_scheduler_dev
    }

    webserver_def = {
        "deploy-local": airflow_webserver,
        "deploy-local-dev": airflow_webserver_dev
    }

    services = {
        "postgres": airflow_postgres,
        "redis": airflow_redis,
        "airflow-webserver": webserver_def[run_scope],
        "airflow-scheduler": scheduler_def[run_scope],
        "airflow-init": airflow_init,
        **dependencies_services
    }

    # Volumes
    volumes = {"postgres-airflow-volume": None}

    # Networks
    networks = {}

    # Conditional items
    if include_airflow_cli:
        services.update({"airflow-cli": airflow_cli})
    if include_airflow_triggerer:
        services.update({"airflow-triggerer": airflow_triggerer})
    if include_flower:
        services.update({"flower": flower})

    if include_flowui_backend:
        backend_def = {
            "deploy-local": flowui_backend,
            "deploy-local-dev": flowui_backend_dev
        }
        services.update({"flowui-backend": backend_def[run_scope]})
        services.update({"flowui-postgres": flowui_postgres})
        volumes.update({"flowui-postgres-volume": None})
        networks.update({"flowui-postgres-network": {"driver": "bridge"}})

    if include_flowui_frontend:
        frontend_def = {
            "deploy-local": flowui_frontend,
            "deploy-local-dev": flowui_frontend_dev
        }
        services.update({"flowui-frontend": frontend_def[run_scope]})

    file_data = {
        "version": "3",
        "services": services,
        "volumes": volumes,
        "networks": networks
    }

    with open(output_file_path, 'w') as f:
        yaml.dump(
            file_data, 
            f, 
            Dumper=MyDumper,
            indent=4,
            default_style=None, 
            default_flow_style=False, 
            sort_keys=False
        )


if __name__ == '__main__':
    create_docker_compose_file()