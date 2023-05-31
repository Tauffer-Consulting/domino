import ast
from airflow.providers.cncf.kubernetes.operators.kubernetes_pod import KubernetesPodOperator
from airflow.utils.context import Context
from kubernetes.client import models as k8s
from typing import Optional
import copy
from contextlib import closing
from kubernetes.stream import stream as kubernetes_stream
from domino.client.domino_backend_client import DominoBackendRestClient
from domino.schemas.shared_storage import WorkflowSharedStorage


# Ref: https://github.com/apache/airflow/blob/main/airflow/providers/cncf/kubernetes/operators/kubernetes_pod.py
class DominoKubernetesPodOperator(KubernetesPodOperator):
    def __init__(
        self, 
        piece_name: str, 
        repository_id: int, 
        workflow_shared_storage: WorkflowSharedStorage,
        *args, 
        **kwargs
    ):
        super().__init__(*args, **kwargs)
        # This is saved in the self.piece_name airflow @property
        self.running_piece_name = piece_name 
        self.repository_id = repository_id
        self.workflow_shared_storage = workflow_shared_storage
        self.task_id_replaced = self.task_id.replace("_", "-").lower() # doing this because airflow doesn't allow underscores and upper case in mount names
        self.task_env_vars = kwargs.get('env_vars', [])
        # Shared Storage variables
        self.shared_storage_base_mount_path = '/home/shared_storage'
        self.shared_storage_upstream_ids_list = list()
        # TODO change url based on DOMINO_DEPLOY_MODE
        self.backend_client = DominoBackendRestClient(base_url="http://domino-rest-service:8000/")
    

    def build_pod_request_obj(self, context: Optional['Context'] = None) -> k8s.V1Pod:
        """
        We override this method to add the shared storage to the pod.
        This function runs after our own self.execute, by super().execute()
        """
        pod = super().build_pod_request_obj(context)

        if not self.workflow_shared_storage or self.workflow_shared_storage.mode.name == 'none':
            return pod
        if  self.workflow_shared_storage.source.name in ["aws_s3", "gcs"]:
            pod = self.add_shared_storage_sidecar(pod)
        elif self.workflow_shared_storage.source.name == "local":
            pod = self.add_local_shared_storage_volumes(pod)

        return pod

    def add_local_shared_storage_volumes(self, pod: k8s.V1Pod) -> k8s.V1Pod:
        """
        Adds local shared storage volumes to the pod.
        """
        pod_cp = copy.deepcopy(pod)
        pod_cp.spec.volumes = pod.spec.volumes or []
        pod_cp.spec.volumes.append(
            k8s.V1Volume(
                name=f'workflow-shared-storage-volume-{self.task_id_replaced}',
                persistent_volume_claim=k8s.V1PersistentVolumeClaimVolumeSource(claim_name="domino-workflow-shared-storage-volume-claim")
            )
        )

        # Add volume mounts for upstream tasks, using subpaths
        pod_cp.spec.containers[0].volume_mounts = pod_cp.spec.containers[0].volume_mounts or []
        for tid in self.shared_storage_upstream_ids_list:
            pod_cp.spec.containers[0].volume_mounts.append(
                k8s.V1VolumeMount(
                    name=f'workflow-shared-storage-volume-{self.task_id_replaced}', 
                    mount_path=f"{self.shared_storage_base_mount_path}/{tid}",  # path inside main container
                    mount_propagation="HostToContainer",
                    read_only=True,
                )
            )

        # Add volume mount for this task
        pod_cp.spec.containers[0].volume_mounts.append(
            k8s.V1VolumeMount(
                name=f'workflow-shared-storage-volume-{self.task_id_replaced}', 
                mount_path=f"{self.shared_storage_base_mount_path}/{self.task_id}",  # path inside main container
                mount_propagation="Bidirectional",
                read_only=True,
            )
        )
        return pod_cp


    def add_shared_storage_sidecar(self, pod: k8s.V1Pod) -> k8s.V1Pod:
        """
        Adds FUSE mounts shared storage sidecar container.
        """
        # Set up pod Volumes and containers VolumemMounts from Upstream tasks
        volume_mounts_main_container = list()
        volume_mounts_sidecar_container = list()
        pod_volumes_list = list()
        for tid in self.shared_storage_upstream_ids_list:
            tid_replaced = tid.lower().replace("_", "-") # Doing this because k8s doesn't allow underscores in volume names
            volume_mounts_main_container.append(
                k8s.V1VolumeMount(
                    name=f'workflow-shared-storage-volume-{tid_replaced}', 
                    mount_path=f"{self.shared_storage_base_mount_path}/{tid}",  # path inside main container
                    mount_propagation="HostToContainer",
                    read_only=True,
                )
            )
            volume_mounts_sidecar_container.append(
                k8s.V1VolumeMount(
                    name=f'workflow-shared-storage-volume-{tid_replaced}', 
                    mount_path=f"{self.shared_storage_base_mount_path}/{tid}",  # path inside sidecar container
                    mount_propagation="Bidirectional",
                )
            )
            pod_volumes_list.append(
                k8s.V1Volume(
                    name=f'workflow-shared-storage-volume-{tid_replaced}',
                    empty_dir=k8s.V1EmptyDirVolumeSource()
                )
            )
        
        # Set up pod Volumes and containers VolumemMounts for this Operator results
        volume_mounts_main_container.append(
            k8s.V1VolumeMount(
                name=f'workflow-shared-storage-volume-{self.task_id_replaced}', 
                mount_path=f"{self.shared_storage_base_mount_path}/{self.task_id}",  # path inside main container
                mount_propagation="HostToContainer",
                read_only=False,
            )
        )
        volume_mounts_sidecar_container.append(
            k8s.V1VolumeMount(
                name=f'workflow-shared-storage-volume-{self.task_id_replaced}', 
                mount_path=f"{self.shared_storage_base_mount_path}/{self.task_id}",  # path inside sidecar container
                mount_propagation="Bidirectional",
            )
        )
        pod_volumes_list.append(
            k8s.V1Volume(
                name=f'workflow-shared-storage-volume-{self.task_id_replaced}',
                empty_dir=k8s.V1EmptyDirVolumeSource()
            )
        )

        pod_cp = copy.deepcopy(pod)
        pod_cp.spec.volumes = pod.spec.volumes or []
        pod_cp.spec.volumes.extend(pod_volumes_list)
        pod_cp.spec.containers[0].volume_mounts = pod_cp.spec.containers[0].volume_mounts or []
        pod_cp.spec.containers[0].volume_mounts.extend(volume_mounts_main_container)


        # Create and add sidecar container to pod
        storage_piece_secrets = {}
        if self.workflow_shared_storage.source != "local":
            storage_piece_secrets = self._get_piece_secrets(
                piece_repository_id=self.workflow_shared_storage.storage_repository_id,
                piece_name=self.workflow_shared_storage.default_piece_name,
            )

        self.workflow_shared_storage.source = self.workflow_shared_storage.source.name
        env_vars = {
            'DOMINO_WORKFLOW_SHARED_STORAGE': self.workflow_shared_storage.json() if self.workflow_shared_storage else "",
            'DOMINO_WORKFLOW_SHARED_STORAGE_SECRETS': str(storage_piece_secrets),
            'DOMINO_K8S_INSTANTIATE_PIECE_KWARGS': str(self.task_env_vars.get('DOMINO_K8S_INSTANTIATE_PIECE_KWARGS')),
            'DOMINO_WORKFLOW_RUN_SUBPATH': self.workflow_run_subpath,
            'AIRFLOW_UPSTREAM_TASKS_IDS_SHARED_STORAGE': str(self.shared_storage_upstream_ids_list),
        }

        self.shared_storage_sidecar_container_name = f"domino-shared-storage-sidecar-{self.task_id_replaced}"
        sidecar_container = k8s.V1Container(
            name=self.shared_storage_sidecar_container_name,
            command=['bash', '-c', './sidecar_lifecycle.sh'],
            image='ghcr.io/tauffer-consulting/domino-shared-storage-sidecar:latest',
            volume_mounts=volume_mounts_sidecar_container,
            security_context=k8s.V1SecurityContext(privileged=True),
            env=[k8s.V1EnvVar(name=k, value=v) for k, v in env_vars.items()],
            resources=k8s.V1ResourceRequirements(
                requests={
                    "cpu": "1m",
                    "memory": "128Mi",
                },
                limits={
                    "cpu": "1000m",
                    "memory": "1024Mi",
                }
            ),
        )
        pod_cp.spec.containers.append(sidecar_container)

        return pod_cp

    def _get_piece_secrets(self, piece_repository_id: int, piece_name: str):
        # Get piece secrets values from api and append to env vars
        secrets_response = self.backend_client.get_piece_secrets(
            piece_repository_id=piece_repository_id,
            piece_name=piece_name
        )
        if secrets_response.status_code != 200:
            raise Exception(f"Error getting piece secrets: {secrets_response.json()}")
        piece_secrets = {
            e.get('name'): e.get('value') 
            for e in secrets_response.json()
        }
        return piece_secrets

    def _get_piece_kwargs_with_upstream_xcom(self, upstream_xcoms_data: dict):
        domino_k8s_run_op_kwargs = [var for var in self.env_vars if getattr(var, 'name', None) == 'DOMINO_K8S_RUN_PIECE_KWARGS']
        if not domino_k8s_run_op_kwargs:
            domino_k8s_run_op_kwargs = {
                "name": "DOMINO_K8S_RUN_PIECE_KWARGS",
                "value": {}
            }
        else:
            domino_k8s_run_op_kwargs = domino_k8s_run_op_kwargs[0]
            domino_k8s_run_op_kwargs = {
                "name": "DOMINO_K8S_RUN_PIECE_KWARGS",
                "value": ast.literal_eval(domino_k8s_run_op_kwargs.value)
            }
        
        # Update Operator kwargs with upstream tasks XCOM data
        # Also updates the list of upstream tasks for which we need to mount the results path
        updated_op_kwargs = dict()
        for k, v in domino_k8s_run_op_kwargs.get('value').items():
            if isinstance(v, dict) and v.get("type", None) == "fromUpstream":
                upstream_task_id = v.get("upstream_task_id")
                output_arg = v.get("output_arg")
                output_value = upstream_xcoms_data[upstream_task_id][output_arg]
                output_type = upstream_xcoms_data[upstream_task_id][f"{output_arg}_type"]
                # If upstream output type is FilePath or DirectoryPath, we need to add the basic path prefix
                # if output_type in ["file-path", "directory-path"]:
                #     output_value = f"{self.shared_storage_base_mount_path}/{upstream_task_id}/results/{output_value}"
                updated_op_kwargs[k] = output_value
                if upstream_task_id not in self.shared_storage_upstream_ids_list:
                    self.shared_storage_upstream_ids_list.append(upstream_task_id)
            else:
                updated_op_kwargs[k] = v

        self.env_vars.append({
            'name': 'AIRFLOW_UPSTREAM_TASKS_IDS_SHARED_STORAGE',
            'value': str(self.shared_storage_upstream_ids_list),
            'value_from': None
        })

        return updated_op_kwargs

    @staticmethod
    def _get_upstream_xcom_data_from_task_ids(task_ids: list, context: 'Context'):
        upstream_xcoms_data = dict()
        for tid in task_ids:
            upstream_xcoms_data[tid] = context['ti'].xcom_pull(task_ids=tid)
        return upstream_xcoms_data

    def _update_env_var_value_from_name(self, name: str, value: str):
        for env_var in self.env_vars:
            if env_var.name == name:
                env_var.value = value
                break

    def execute(self, context: Context):
        self._prepare_execute_environment(context=context)
        remote_pod = None
        try:
            self.pod_request_obj = self.build_pod_request_obj(context)
            self.pod = self.get_or_create_pod(  # must set `self.pod` for `on_kill`
                pod_request_obj=self.pod_request_obj,
                context=context,
            )
            # get remote pod for use in cleanup methods
            remote_pod = self.find_pod(self.pod.metadata.namespace, context=context)
            self.await_pod_start(pod=self.pod)

            if self.get_logs:
                self.pod_manager.fetch_container_logs(
                    pod=self.pod,
                    container_name=self.BASE_CONTAINER_NAME,
                    follow=True,
                )
            else:
                self.pod_manager.await_container_completion(
                    pod=self.pod, container_name=self.BASE_CONTAINER_NAME
                )

            if self.do_xcom_push:
                result = self.extract_xcom(pod=self.pod)

            if self.workflow_shared_storage and self.workflow_shared_storage.mode.name != 'none':
                self._kill_shared_storage_sidecar(pod=self.pod)
            remote_pod = self.pod_manager.await_pod_completion(self.pod)
        finally:
            self.cleanup(
                pod=self.pod or self.pod_request_obj,
                remote_pod=remote_pod,
            )
        ti = context['ti']
        ti.xcom_push(key='pod_name', value=self.pod.metadata.name)
        ti.xcom_push(key='pod_namespace', value=self.pod.metadata.namespace)
        if self.do_xcom_push:
            return result

    def _prepare_execute_environment(self, context: Context):
        """ 
        Prepare execution with the following configurations:
        - pass extra arguments and configuration as environment variables to the pod
        - add shared storage sidecar container to the pod - if shared storage is FUSE based
        - add shared storage volume mounts to the pod - if shared storage is NFS based or local
        """

        # Fetch upstream tasks ids and save them in an ENV var
        upstream_task_ids = [t.task_id for t in self.get_direct_relatives(upstream=True)]
        self.env_vars.append({
            'name': 'AIRFLOW_UPSTREAM_TASKS_IDS',
            'value': str(upstream_task_ids),
            'value_from': None
        })

        self.env_vars.append({
            'name': 'DOMINO_WORKFLOW_SHARED_STORAGE',
            'value': str(self.workflow_shared_storage.source.name) if self.workflow_shared_storage else None,
            'value_from': None
        })

        # Save updated piece input kwargs with upstream data to environment variable
        upstream_xcoms_data = self._get_upstream_xcom_data_from_task_ids(task_ids=upstream_task_ids, context=context)
        domino_k8s_run_op_kwargs = self._get_piece_kwargs_with_upstream_xcom(upstream_xcoms_data=upstream_xcoms_data)        
        self._update_env_var_value_from_name(name='DOMINO_K8S_RUN_PIECE_KWARGS', value=str(domino_k8s_run_op_kwargs))
        
        # Add pieces secrets to environment variables
        piece_secrets = self._get_piece_secrets(piece_repository_id=self.repository_id, piece_name=self.running_piece_name)
        self.env_vars.append({
            "name": "DOMINO_K8S_PIECE_SECRETS",
            "value": str(piece_secrets),
            "value_from": None
        })

        # Include workflow run subpath from dag run id, taken from context
        dag_id = context["dag_run"].dag_id
        dag_run_id = context['run_id']
        dag_run_id_path = dag_run_id.replace("-", "_").replace(".", "_").replace(" ", "_").replace(":", "_").replace("+", "_")
        self.workflow_run_subpath = f"{dag_id}/{dag_run_id_path}"
        self.env_vars.append({
            'name': 'DOMINO_WORKFLOW_RUN_SUBPATH',
            'value': self.workflow_run_subpath,
            'value_from': None
        })

    def _kill_shared_storage_sidecar(self, pod: k8s.V1Pod):
        """
        This method is used to send a signal to stop and delete the sidecar container with the shared storage mounts.
        """
        with closing(
            kubernetes_stream(
                self.pod_manager._client.connect_get_namespaced_pod_exec,
                pod.metadata.name,
                pod.metadata.namespace,
                container=self.shared_storage_sidecar_container_name,
                command=['/bin/bash'],
                stdin=True,
                stdout=True,
                stderr=True,
                tty=False,
                _preload_content=False,
            )
        ) as resp:
            self.log.info('Sending signal to unmount shared storage sidecar container')
            self.pod_manager._exec_pod_command(resp, 'python mount.py unmount')
            self.log.info('Sending signal to delete shared storage sidecar container')
            self.pod_manager._exec_pod_command(resp, 'kill -s SIGINT 1')





