import uuid
from datetime import datetime
import requests
from urllib.parse import urljoin
import os


class AirflowRestClient(requests.Session):
    def __init__(self, *args, **kwargs):
        """
        _summary_
        """
        super(AirflowRestClient, self).__init__(*args, **kwargs)

        self.base_url = os.getenv("AIRFLOW_WEBSERVER_HOST")

        # TODO using airflow admin only for dev
        self.auth = ("airflow", "airflow")

    def request(self, method, resource, **kwargs):
        """
        _summary_

        Args:
            method (_type_): _description_
            resource (_type_): _description_

        Raises:
            e: _description_

        Returns:
            _type_: _description_
        """
        try:
            url = urljoin(self.base_url, resource)
            return super(AirflowRestClient, self).request(method, url, **kwargs)
        except Exception as e:
            # self.logger.exception(e)
            raise e

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
    
    def get_all_dag_tasks(self, dag_id):
        resource = f"api/v1/dags/{dag_id}/tasks"
        response = self.request(
            method='get',
            resource=resource,
        )
        return response

    def get_all_dag_runs(self, dag_id):
        resource = f"api/v1/dags/{dag_id}/dagRuns"
        response = self.request(
            method='get',
            resource=resource,
        )
        return response

    def get_xcom_by_task_id(self, dag_id, dag_run_id, task_id):
        resource = f"api/v1/dags/{dag_id}/dagRuns/{dag_run_id}/taskInstances/{task_id}/xcomEntries"
        response = self.request(
            method='get',
            resource=resource,
        )
        return response