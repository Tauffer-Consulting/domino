import requests
from requests.exceptions import ConnectionError, Timeout
import time
import docker
from domino.logger import get_configured_logger


class TestingHttpClient:

    docker_client = docker.from_env()
    DOMINO_HTTP_SERVER_PATH = 'domino/domino_py/domino/testing/http_server.py'
    DOMINO_INTERNAL_REPOSITORY_FOLDER_PATH = "/home/domino/pieces_repository/"
    BASE_HTTP_SERVER_HOST_URL = "http://localhost:8080"
    logger = get_configured_logger("TestingHttpClient")

    @classmethod
    def wait_health_check(cls):
        max_retries = 5
        retry_delay_in_seconds = 1
        url = f'{cls.BASE_HTTP_SERVER_HOST_URL}/health-check'
        for _ in range(max_retries):
            try:
                response = requests.get(url)
                response.raise_for_status()
                return response
            except (ConnectionError, Timeout) as e:
                cls.logger.info(f"Health Check Failed.\nRetrying in {retry_delay_in_seconds} seconds...")
                time.sleep(retry_delay_in_seconds)
        raise Exception("Max retries exceeded. Unable to make the request.")


    @classmethod
    def start_http_server(cls, image: str):
        try:
            container = cls.docker_client.containers.run(
                image=image,
                command=f"python {cls.DOMINO_HTTP_SERVER_PATH}",
                ports={'8080/tcp': ('0.0.0.0', 8080)},
                detach=True
            )
            container_state = container.attrs.get('State').get('Running')
            container_status = container.attrs.get('State').get('Status', None)
            while not container_state and container_status != 'running':
                container = cls.docker_client.containers.get(container.id)
                container_state = container.attrs.get('State').get('Running')
                container_status = container.attrs.get('State').get('Status')
                print('Waiting for container to start...')
                time.sleep(0.2)
            cls.wait_health_check()
            return container
        except Exception as e:
            container = cls.docker_client.containers.get('domino_testing_http_server')
            if container:
                container.stop()
                container.remove()
            raise e

    @classmethod
    def send_dry_run_request(
        cls,
        piece_name: str,
        input_data: dict,
        secrets_data: dict
    ):
        url = f"{cls.BASE_HTTP_SERVER_HOST_URL}/test"
        body_data = dict(
            piece_name=piece_name,
            input_data=input_data,
            secrets_data=secrets_data,
            repository_folder_path=cls.DOMINO_INTERNAL_REPOSITORY_FOLDER_PATH
        )

        response = requests.post(url, json=body_data)
        return response