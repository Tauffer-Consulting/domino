from domino.logger import get_configured_logger
from datetime import datetime
import requests
from urllib.parse import urljoin
import os


class DominoBackendRestClient(requests.Session):
    def __init__(self, base_url: str = None, *args, **kwargs):
        super(DominoBackendRestClient, self).__init__(*args, **kwargs)
        self.logger = get_configured_logger(self.__class__.__name__)
        if base_url:
            self.base_url = base_url
        else:
            self.base_url = os.environ.get("DOMINO_BACKEND_HOST", "http://localhost:8000")

    def request(self, method, resource, **kwargs):
        try:
            url = urljoin(self.base_url, resource)
            return super(DominoBackendRestClient, self).request(method, url, **kwargs)
        except Exception as e:
            self.logger.exception(e)
            raise e

    def health_check(self):
        resource = "/health-check"
        response = self.request(
            method="get",
            resource=resource
        )
        return response

    def get_piece_secrets(self, piece_repository_id: int, piece_name: str):
        resource = f"/pieces-repositories/{piece_repository_id}/secrets/{piece_name}"
        response = self.request(
            method='get',
            resource=resource
        )
        return response

    def get_piece_repository(self, piece_repository_id: int):
        resource = f"/pieces-repositories/{piece_repository_id}"
        response = self.request(
            method='get',
            resource=resource
        )
        return response

    def get_piece_repositories(self, workspace_id: int, filters: dict):
        resource = f"/workspaces/{workspace_id}/pieces-repositories"
        response = self.request(
            method='get',
            resource=resource,
            params=filters
        )
        return response
