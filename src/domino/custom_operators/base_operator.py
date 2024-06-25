from domino.custom_operators.docker_operator import DominoDockerOperator
from domino.custom_operators.k8s_operator import DominoKubernetesPodOperator
import os
from typing import Optional, Dict
from domino.schemas.shared_storage import WorkflowSharedStorage


class DominoBaseOperator:
    def __new__(
        cls,
        dag_id: str,
        task_id: str,
        piece_name: str,
        piece_source_image: str,
        deploy_mode: str,
        repository_url: str,
        repository_version: str,
        workspace_id: int,
        piece_input_kwargs: Optional[Dict] = None,
        workflow_shared_storage: Optional[WorkflowSharedStorage] = None,
        container_resources: Optional[Dict] = None,
    ):
        if deploy_mode == "local-compose":
            return DominoDockerOperator(
                dag_id=dag_id,
                task_id=task_id,
                piece_name=piece_name,
                deploy_mode=deploy_mode,
                repository_url=repository_url,
                repository_version=repository_version,
                workspace_id=workspace_id,
                piece_input_kwargs=piece_input_kwargs,
                workflow_shared_storage=workflow_shared_storage,
                container_resources=container_resources or {},
                # ----------------- Docker -----------------
                # TODO uncoment
                image=piece_source_image,
                entrypoint=["domino", "run-piece-docker"],
                do_xcom_push=True,
                mount_tmp_dir=False,
                tty=True,
                xcom_all=False,
                retrieve_output=True,
                retrieve_output_path="/airflow/xcom/return.out",
            )
        elif deploy_mode in ["local-k8s", "local-k8s-dev", "prod", "k8s"]:
            return DominoKubernetesPodOperator(
                dag_id=dag_id,
                task_id=task_id,
                piece_name=piece_name,
                deploy_mode=deploy_mode,
                repository_url=repository_url,
                repository_version=repository_version,
                workspace_id=workspace_id,
                piece_input_kwargs=piece_input_kwargs,
                workflow_shared_storage=workflow_shared_storage,
                container_resources=container_resources or {},
                # ----------------- Kubernetes -----------------
                namespace="default",
                image=piece_source_image,
                image_pull_policy="IfNotPresent",
                name=f"airflow-worker-pod-{task_id}",
                startup_timeout_seconds=600,
                annotations={
                    "sidecar.istio.io/inject": "false"
                },  # TODO - remove this when istio is working with airflow k8s pod
                # cmds=["/bin/bash"],
                # arguments=["-c", "sleep 120;"],
                cmds=["domino"],
                arguments=["run-piece-k8s"],
                do_xcom_push=True,
                in_cluster=True,
            )
        else:
            raise Exception(f"Invalid deploy mode: {deploy_mode}")

    @classmethod
    def partial(cls, **kwargs):
        deploy_mode = os.environ.get("DOMINO_DEPLOY_MODE")
        if deploy_mode == "local-compose":
            return DominoDockerOperator.partial(**kwargs)
        elif deploy_mode in ["local-k8s", "local-k8s-dev", "prod", "k8s"]:
            return DominoKubernetesPodOperator.partial(**kwargs)
        else:
            raise Exception(f"Invalid deploy mode: {deploy_mode}")