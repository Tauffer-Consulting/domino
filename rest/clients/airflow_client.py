import uuid
from datetime import datetime
import requests
from aiohttp import BasicAuth
from urllib.parse import urljoin
from core.logger import get_configured_logger
from core.settings import settings


class AirflowRestClient(requests.Session):
    def __init__(self, *args, **kwargs):
        super(AirflowRestClient, self).__init__(*args, **kwargs)

        self.base_url = settings.AIRFLOW_WEBSERVER_HOST
        self.auth = (settings.AIRFLOW_ADMIN_CREDENTIALS.get('username'), settings.AIRFLOW_ADMIN_CREDENTIALS.get('password'))
        self.logger = get_configured_logger(self.__class__.__name__)

        self.max_page_size = 100
        self.min_page_size = 1
        self.min_page = 0


    def _validate_pagination_params(self, page, page_size):
        page = max(page, self.min_page)
        page_size = max(self.min_page_size, min(page_size, self.max_page_size))

        return page, page_size


    def request(self, method, resource, **kwargs):
        try:
            url = urljoin(self.base_url, resource)
            return super(AirflowRestClient, self).request(method, url, **kwargs)
        except Exception as e:
            self.logger.exception(e)
            raise e

    async def _request_async(self, session, method, resource, **kwargs):
        """
        Request method
        Args:
            session (aiohttp.ClientSession): aiohttp session instance
        Returns:
            data (dict): data returned by the API
        """
        try:
            url = urljoin(self.base_url, resource)
            auth = BasicAuth(*self.auth)
            response = await session.request(method, url, auth=auth, **kwargs)
            response.raise_for_status()
        except Exception:
            self.logger.exception(f'API {method} Request error. Url: {resource}. Params {kwargs}')
            return None

        data = await response.json()
        return data

    def run_dag(self, dag_id):
        resource = f"api/v1/dags/{dag_id}/dagRuns"
        dag_run_uuid = str(uuid.uuid4())
        payload = {
            "dag_run_id": f"rest-client-{dag_run_uuid}",
            "logical_date": datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        }
        response = self.request(
            method="post",
            resource=resource,
            json=payload
        )
        return response

    def delete_dag(self, dag_id):
        resource = f"api/v1/dags/{dag_id}"
        response = self.request(
            method="delete",
            resource=resource,
        )
        return response

    def update_dag(self, dag_id, payload):
        resource = f"api/v1/dags/{dag_id}"
        response = self.request(
            method='patch',
            resource=resource,
            json=payload
        )
        return response

    def get_dag_by_id(self, dag_id):
        resource = f"api/v1/dags/{dag_id}"
        response = self.request(
            method='get',
            resource=resource,
        )
        return response

    async def get_dag_by_id_async(self, session, dag_id):
        resource = f"api/v1/dags/{dag_id}"
        response = await self._request_async(session, 'GET', resource)
        return {
            'dag_id': dag_id,
            'response': response
        }

    def get_all_dag_tasks(self, dag_id):
        resource = f"api/v1/dags/{dag_id}/tasks"
        response = self.request(
            method='get',
            resource=resource,
        )
        return response

    def get_all_workflow_runs(self, dag_id: str, page: int, page_size: int):
        page, page_size = self._validate_pagination_params(page, page_size)
        offset = page * page_size
        resource = f"api/v1/dags/{dag_id}/dagRuns?limit={page_size}&offset={offset}"
        response = self.request(
            method='get',
            resource=resource,
        )
        return response

    def get_all_run_tasks_instances(self, dag_id: str, dag_run_id: str, page: int, page_size: int):
        page, page_size = self._validate_pagination_params(page, page_size)
        offset = page * page_size
        resource = f"api/v1/dags/{dag_id}/dagRuns/{dag_run_id}/taskInstances?limit={page_size}&offset={offset}"
        response = self.request(
            method='get',
            resource=resource,
        )
        return response

    def get_task_logs(self, dag_id: str, dag_run_id: str, task_id: str, task_try_number: int):
        resource = f"/api/v1/dags/{dag_id}/dagRuns/{dag_run_id}/taskInstances/{task_id}/logs/{task_try_number}"
        response = self.request(
            method='get',
            resource=resource,
        )
        return response

    def get_task_result(self, dag_id: str, dag_run_id: str, task_id: str, task_try_number: int):
        # ref: https://airflow.apache.org/docs/apache-airflow/stable/stable-rest-api-ref.html#operation/get_xcom_entries
        resource = f"/api/v1/dags/{dag_id}/dagRuns/{dag_run_id}/taskInstances/{task_id}/xcomEntries"
        response = self.request(
            method='get',
            resource=resource,
        )
        # Get base64_content
        result_dict = dict()
        resource = f"/api/v1/dags/{dag_id}/dagRuns/{dag_run_id}/taskInstances/{task_id}/xcomEntries/base64_content"
        response = self.request(
            method='get',
            resource=resource,
        )
        if response.status_code != 200:
            raise BaseException("Error while trying to get task result base64_content")
        result_dict["base64_content"] = response.json()["value"]
        # Get file_type
        resource = f"/api/v1/dags/{dag_id}/dagRuns/{dag_run_id}/taskInstances/{task_id}/xcomEntries/file_type"
        response = self.request(
            method='get',
            resource=resource,
        )
        if response.status_code != 200:
            raise BaseException("Error while trying to get task result file_type")
        result_dict["file_type"] = response.json()["value"]
        return result_dict

