from airflow import DAG
from kubernetes.client import models as k8s
from datetime import datetime
from typing import Callable

from domino.custom_operators.docker_operator import DominoDockerOperator
from domino.custom_operators.python_operator import PythonOperator
from domino.custom_operators.k8s_operator import DominoKubernetesPodOperator
from domino.schemas.shared_storage import shared_storage_map
from domino.utils import dict_deep_update
from domino.logger import get_configured_logger
from domino.schemas.shared_storage import StorageSource
from domino.schemas.container_resources import ContainerResourcesModel
from kubernetes import client, config
import os


class Task(object):
    """
    The Task object represents a task in a workflow. 
    It is only instantiated by processes parsing dag files in Airflow.
    """

    def __init__(
        self, 
        dag: DAG, 
        task_id: str,
        piece: dict,
        piece_input_kwargs: dict,
        workflow_shared_storage: dict = None,
        container_resources: dict = None,
        **kwargs
    ) -> None:
        # Task configuration and attributes
        self.task_id = task_id
        self.logger = get_configured_logger(f"{self.__class__.__name__ }-{self.task_id}")
        self.logger.info('### Configuring task object ###')
        self.dag = dag
        self.dag_id = self.dag.dag_id
        self.repository_id = piece["repository_id"]
        self.piece = piece
        if not workflow_shared_storage:
            workflow_shared_storage = {}
        # Shared storage
        workflow_shared_storage_source = StorageSource(workflow_shared_storage.pop("source", "None")).name
        provider_options = workflow_shared_storage.pop("provider_options", {})
        self.workflow_shared_storage = shared_storage_map[workflow_shared_storage_source](**workflow_shared_storage, **provider_options) if shared_storage_map[workflow_shared_storage_source] else shared_storage_map[workflow_shared_storage_source]
        # Container resources
        self.container_resources = container_resources if container_resources else {}
        self.provide_gpu = self.container_resources.pop("use_gpu", False)
        
        self.deploy_mode = os.environ.get('DOMINO_DEPLOY_MODE')


        if self.deploy_mode in ['local-k8s', 'local-k8s-dev', 'prod']:
            config.load_incluster_config()
            self.k8s_client = client.CoreV1Api()

        # Set up piece logic
        self._task_piece = self._set_piece(piece_input_kwargs)

    def _set_piece(self, piece_input_kwargs) -> None:
        """
        Set airflow piece based on task configuration
        """

        if self.deploy_mode == "local-python":
            return PythonOperator(
                dag=self.dag,
                task_id=self.task_id,
                start_date=datetime(2021, 1, 1), # TODO - get correct start_date
                provide_context=True,
                op_kwargs=piece_input_kwargs,
                # queue=dependencies_group,
                make_python_callable_kwargs=dict(
                    piece_name=self.piece_name,
                    deploy_mode=self.deploy_mode,
                    task_id=self.task_id,
                    dag_id=self.dag_id,
                )
            )

        # References: 
        # - https://airflow.apache.org/docs/apache-airflow/1.10.14/_api/airflow/contrib/operators/kubernetes_pod_operator/index.html
        # - https://airflow.apache.org/docs/apache-airflow/stable/templates-ref.html
        # - https://www.astronomer.io/guides/templating/
        # - good example: https://github.com/apache/airflow/blob/main/tests/system/providers/cncf/kubernetes/example_kubernetes.py
        # - commands HAVE to go in a list object: https://stackoverflow.com/a/55149915/11483674
        elif self.deploy_mode in ["local-k8s", "local-k8s-dev", "prod"]:
            container_env_vars = {
                "DOMINO_K8S_PIECE": self.piece["name"],
                "DOMINO_K8S_INSTANTIATE_PIECE_KWARGS": str({
                    "deploy_mode": self.deploy_mode,
                    "task_id": self.task_id,
                    "dag_id": self.dag_id,
                }),
                "DOMINO_K8S_RUN_PIECE_KWARGS": str(piece_input_kwargs),
                "DOMINO_WORKFLOW_SHARED_STORAGE": self.workflow_shared_storage.json() if self.workflow_shared_storage else "",
                "AIRFLOW_CONTEXT_EXECUTION_DATETIME": "{{ dag_run.logical_date | ts_nodash }}",
                "AIRFLOW_CONTEXT_DAG_RUN_ID": "{{ run_id }}",
            }
            base_container_resources_model = ContainerResourcesModel(
                requests={
                    "cpu": "100m",
                    "memory": "128Mi",
                },
                limits={
                    "cpu": "100m",
                    "memory": "128Mi",
                }
            )
            
            # Container resources
            basic_container_resources = base_container_resources_model.dict()
            basic_container_resources = dict_deep_update(basic_container_resources, self.container_resources)
            if self.provide_gpu:
                basic_container_resources["limits"]["nvidia.com/gpu"] = "1"
            #self.container_resources = ContainerResourcesModel(**self.container_resources)
            container_resources_obj = k8s.V1ResourceRequirements(**basic_container_resources)

            # Volumes
            all_volumes = []
            all_volume_mounts = []

            ######################## For local DOMINO_DEPLOY_MODE Operators dev ###########################################
            if self.deploy_mode == 'local-k8s-dev':
                source_image = self.piece.get('source_image')
                repository_raw_project_name = str(source_image).split('/')[2].split(':')[0]
                persistent_volume_claim_name = 'pvc-{}'.format(str(repository_raw_project_name.lower().replace('_', '-')))

                persistent_volume_name = 'pv-{}'.format(str(repository_raw_project_name.lower().replace('_', '-')))
                persistent_volume_claim_name = 'pvc-{}'.format(str(repository_raw_project_name.lower().replace('_', '-')))

                pvc_exists = False
                try:
                    self.k8s_client.read_namespaced_persistent_volume_claim(name=persistent_volume_claim_name, namespace='default')
                    pvc_exists = True
                except client.rest.ApiException as e:
                    if e.status != 404:
                        raise e

                pv_exists = False
                try:
                    self.k8s_client.read_persistent_volume(name=persistent_volume_name)
                    pv_exists = True
                except client.rest.ApiException as e:
                    if e.status != 404:
                        raise e

                if pv_exists and pvc_exists:
                    volume_dev_pieces = k8s.V1Volume(
                        name='dev-op-{path_name}'.format(path_name=str(repository_raw_project_name.lower().replace('_', '-'))),
                        persistent_volume_claim=k8s.V1PersistentVolumeClaimVolumeSource(
                            claim_name=persistent_volume_claim_name
                        ),
                    )
                    volume_mount_dev_pieces = k8s.V1VolumeMount(
                        name='dev-op-{path_name}'.format(path_name=str(repository_raw_project_name.lower().replace('_', '-'))), 
                        mount_path=f'/home/domino/pieces_repository',
                        sub_path=None, 
                        read_only=True
                    )
                    all_volumes.append(volume_dev_pieces)
                    all_volume_mounts.append(volume_mount_dev_pieces)
                
                ######################## For local Domino dev ###############################################
                domino_package_local_claim_name = 'domino-dev-volume-claim'
                pvc_exists = False
                try:
                    self.k8s_client.read_namespaced_persistent_volume_claim(name=domino_package_local_claim_name, namespace='default')
                    pvc_exists = True
                except client.rest.ApiException as e:
                    if e.status != 404:
                        raise e

                if pvc_exists:
                    volume_dev = k8s.V1Volume(
                        name='jobs-persistent-storage-dev',
                        persistent_volume_claim=k8s.V1PersistentVolumeClaimVolumeSource(claim_name=domino_package_local_claim_name),
                    )
                    volume_mount_dev = k8s.V1VolumeMount(
                        name='jobs-persistent-storage-dev', 
                        mount_path='/home/domino/domino_py', 
                        sub_path=None,
                        read_only=True
                    )
                    all_volumes.append(volume_dev)
                    all_volume_mounts.append(volume_mount_dev)
            ############################################################################################

            pod_startup_timeout_in_seconds = 600
            return DominoKubernetesPodOperator(
                piece_name=self.piece.get('name'),
                repository_id=self.repository_id,
                workflow_shared_storage=self.workflow_shared_storage,
                namespace='default',  # TODO - separate namespace by User or Workspace?
                image=self.piece["source_image"],
                image_pull_policy='IfNotPresent',
                task_id=self.task_id,
                name=f"airflow-worker-pod-{self.task_id}",
                startup_timeout_seconds=pod_startup_timeout_in_seconds,
                # cmds=["python"],
                # arguments=["-c", "'import time; time.sleep(10000)'"],
                cmds=["domino"],
                arguments=["run-piece-k8s"],
                env_vars=container_env_vars,
                do_xcom_push=True,
                in_cluster=True,
                volumes=all_volumes,
                volume_mounts=all_volume_mounts,
                container_resources=container_resources_obj,
            )
        
        elif self.deploy_mode == 'local-compose':
            return DominoDockerOperator(
                task_id=self.task_id,
                piece_name=self.piece.get('name'),
                repository_id=self.repository_id,
                piece_kwargs=piece_input_kwargs,
                dag_id=self.dag_id,
                deploy_mode=self.deploy_mode,
                image=self.piece["source_image"],
                workflow_shared_storage=self.workflow_shared_storage,
                do_xcom_push=True,
                mount_tmp_dir=False,
                tty=True,
                xcom_all=False,
                retrieve_output=True,
                retrieve_output_path='/airflow/xcom/return.out',
                entrypoint=["domino", "run-piece-docker"],
            )


    def __call__(self) -> Callable:
        return self._task_piece