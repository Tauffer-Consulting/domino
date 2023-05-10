import abc
import json
import os
import ast
from datetime import datetime
from pathlib import Path
import pydantic
import pickle
from domino.logger import get_configured_logger
from domino.schemas.deploy_mode import DeployModeType
from domino.exceptions.exceptions import InvalidPieceOutputError
import time
import subprocess


class BasePiece(metaclass=abc.ABCMeta):

    @classmethod
    def set_metadata(cls, metadata):
        """
        _summary_

        Args:
            metadata (_type_): _description_
        """
        # Piece name as used by Airflow
        cls.__name__ = metadata.get("name", "BasePiece")

        # Full metadata
        cls._metadata_ = metadata


    def __init__(
        self,
        deploy_mode: DeployModeType,
        task_id: str,
        dag_id: str,
    ) -> None:
        """
        The base class from which every Domino custom Piece should inherit from.
        BasePiece methods and variables that can be used by inheriting Pieces classes:
        self.results_path - Path to store results data
        self.logger - Logger functionality

        Args:
            deploy_mode (DeployModeType): _description_
            task_id (str): _description_
            dag_id (str): _description_
        """

        # Piece task attributes
        self.task_id = task_id
        self.dag_id = dag_id
        self.deploy_mode = deploy_mode

        # Logger
        self.logger = get_configured_logger(f"{self.__class__.__name__ }-{self.task_id}")


    def start_logger(self):
        """
        Start logger.
        """
        self.logger.info(f"Started {self.task_id} of type {self.__class__.__name__} at {str(datetime.now().isoformat())}")

    def _wait_for_sidecar_paths(self):
        # Wait for sidecar create directories
        while True:
            if Path(self.report_path).is_dir():
                break
            time.sleep(2)

    def generate_paths(self):
        """
        Generates paths for shared storage.
        """
        # Base path for fetching and storing runs results
        if not Path(self.workflow_shared_storage).is_dir():
            Path(self.workflow_shared_storage).mkdir(parents=True, exist_ok=True)

        # # Path to store results data
        if not Path(self.results_path).is_dir():
            Path(self.results_path).mkdir(parents=True, exist_ok=True)

        # # Path to store XCOM data - XCOM data is saved here AND also at /airflow/xcom/return.json
        if not Path(self.xcom_path).is_dir():
            Path(self.xcom_path).mkdir(parents=True, exist_ok=True)

        # # Path to store report data
        if not Path(self.report_path).is_dir():
            Path(self.report_path).mkdir(parents=True, exist_ok=True)


    def get_upstream_tasks_data(self):
        """
        Get XCOM and results data from upstream tasks. Stores this information in the attribute `self.upstream_task_data` as a dictionary with the following structure:
        {
            "task_id_1": {
                "xcom": {...},
                "results": "path/to/results"
            },
            "task_id_2": {...},
        }

        Raises:
            NotImplementedError: _description_
        """
        self.upstream_tasks_data = dict()
        if self.deploy_mode == "k8s":
            upstream_tasks_ids = ast.literal_eval(os.getenv("AIRFLOW_UPSTREAM_TASKS_IDS", str(list())))
            for tid in upstream_tasks_ids:
                self.upstream_tasks_data[tid] = dict()
                self.upstream_tasks_data[tid]["results"] = self.workflow_shared_storage + f"/{tid}/results"
                with open(f"{self.workflow_shared_storage}/{tid}/xcom/return.json") as f:
                    self.upstream_tasks_data[tid]["xcom"] = json.load(f)
        else:
            raise NotImplementedError(f"Get upstream XCOM not implemented for deploy_mode=={self.deploy_mode}")

    
    def validate_and_get_env_secrets(self, piece_secrets_model: pydantic.BaseModel = None, secrets_values=None):
        """
        Get secret variables for this Piece from ENV. The necessary secret variables to run the Piece should be defined in the Piece's SecretsModel.
        The secrets can then be retrieved and used in the Piece's `piece_function` method as such:
        ```
        my_secret = self.secrets.my_secret
        ```

        Args:
            piece_secrets_model (pydantic.BaseModel): _description_
        """
        self.secrets = None
        if piece_secrets_model and self.deploy_mode in ['local-k8s', 'local-k8s-dev', 'prod']:
            secrets_names = list(piece_secrets_model.schema()["properties"].keys())
            secrets = dict()
            secrets_values = ast.literal_eval(os.environ.get('DOMINO_K8S_PIECE_SECRETS', '{}'))
            if not secrets_values:
                secrets_values = {}
            for s in secrets_names:
                secrets[s] = secrets_values.get(s, None)
            self.secrets = piece_secrets_model(**secrets)
        elif piece_secrets_model and self.deploy_mode == 'local-compose':
            secrets_names = list(piece_secrets_model.schema()["properties"].keys())
            secrets = dict()
            secrets_values = ast.literal_eval(os.environ.get('DOMINO_DOCKER_PIECE_SECRETS', '{}'))
            self.secrets = piece_secrets_model(**secrets_values)


    def format_xcom(self, output_obj: pydantic.BaseModel) -> dict:
        """
        Formats and adds extra metadata to XCOM dictionary content.

        Args:
            output_obj (dict): Pydantic output model

        Returns:
            dict: XCOM dictionary
        """
        # xcom_obj = output_obj.dict()
        xcom_obj = json.loads(output_obj.json())
        if not isinstance(xcom_obj, dict):
            print(f"Piece {self.__class__.__name__} is not returning a valid XCOM object. Auto-generating a base XCOM for it...")
            self.logger.info(f"Piece {self.__class__.__name__} is not returning a valid XCOM object. Auto-generating a base XCOM for it...")
            xcom_obj = dict()

        # Add arguments types to XCOM 
        # TODO - this is a temporary solution. We should find a better way to do this
        output_schema = output_obj.schema()
        for k, v in output_schema["properties"].items():
            if "type" in v:
                # Get file-path and directory-path types
                if v["type"] == "string" and "format" in v:
                    v_type = v["format"]
                else:
                    v_type = v["type"]
            elif "anyOf" in v:
                if "$ref" in v["anyOf"][0]:
                    type_model = v["anyOf"][0]["$ref"].split("/")[-1]
                    v_type = output_schema["definitions"][type_model]["type"]
            xcom_obj[f"{k}_type"] = v_type

        # Update XCOM with extra metadata
        xcom_obj.update(
            piece_name=self.__class__.__name__,
            piece_metadata=self._metadata_
        )
        return xcom_obj


    def push_xcom(self, xcom_obj: dict):
        """
        Push piece's output to XCOM, to be used by downstream pieces.

        Args:
            xcom_obj (dict): Formatted XCOM object as a dictionary

        Raises:
            NotImplementedError: _description_
        """
        if self.deploy_mode in ["local-python"]:
            self.airflow_context['ti'].xcom_push(key=self.task_id, value=xcom_obj)
        elif self.deploy_mode == "local-compose":
            file_path = Path('/airflow/xcom/return.out')
            file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(str(file_path), 'wb') as fp:
                pickle.dump(xcom_obj, fp)

        elif self.deploy_mode == "local-bash":
            # For our extended BashOperator, return XCom must be stored in /opt/mnt/fs/tmp/xcom_output.json
            file_path = Path("/opt/mnt/fs/tmp/xcom_output.json")
            file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(str(file_path), 'w') as fp:
                json.dump(xcom_obj, fp, indent=4)
        elif self.deploy_mode in ["k8s", "local-k8s", "local-k8s-dev"]:
            # In Kubernetes, return XCom must be stored in /airflow/xcom/return.json
            # https://airflow.apache.org/docs/apache-airflow-providers-cncf-kubernetes/stable/pieces.html#how-does-xcom-work
            file_path = Path('/airflow/xcom/return.json')
            file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(str(file_path), 'w') as fp:
                json.dump(xcom_obj, fp)

            # Also store it at /home/workflow_shared_data/{self.task_id}/xcom/return.json for convenience
            file_path = self.xcom_path + "/return.json"
            with open(file_path, 'w') as fp:
                json.dump(xcom_obj, fp)
            #time.sleep(120)
        else:
            raise NotImplementedError("deploy mode not accepted for xcom push")
    

    def run_piece_function(
        self, 
        airflow_context: dict,
        op_kwargs: dict,
        piece_input_model: pydantic.BaseModel,
        piece_output_model: pydantic.BaseModel, 
        piece_secrets_model: pydantic.BaseModel = None,
        secrets_values: dict = None
    ):
        """
        _summary_

        Args:
            airflow_context (dict): Dictionary containing Airflow context information
            op_kwargs (dict): Dictionary containing Piece's kwargs
            piece_input_model (pydantic.BaseModel): Piece's InputModel
            piece_output_model (pydantic.BaseModel): Piece's OutputModel
            piece_secrets_model (pydantic.BaseModel, optional): Piece's SecretsModel. Defaults to None.

        Raises:
            InvalidPieceOutputError: _description_
        """
        # Start logger
        self.start_logger()

        self.piece_input_model = piece_input_model
        self.piece_output_model = piece_output_model
        self.piece_secrets_model = piece_secrets_model

        # Airflow context dictionary: https://composed.blog/airflow/execute-context
        # For local-bash and kubernetes deploy modes, we assemble this ourselves and the context data is more limited
        self.airflow_context = airflow_context
        self.dag_run_id = airflow_context.get("dag_run_id")

        # Check if Piece's necessary secrets are present in ENV
        self.validate_and_get_env_secrets(piece_secrets_model=piece_secrets_model, secrets_values=secrets_values)

        # Generate paths
        workflow_run_subpath = os.environ.get('DOMINO_WORKFLOW_RUN_SUBPATH', '')
        self.workflow_shared_storage = Path("/home/shared_storage") 
        if self.deploy_mode == 'local-compose':
            self.workflow_shared_storage = str(self.workflow_shared_storage / workflow_run_subpath)
        self.results_path = f"{self.workflow_shared_storage}/{self.task_id}/results"
        self.xcom_path = f"{self.workflow_shared_storage}/{self.task_id}/xcom"
        self.report_path = f"{self.workflow_shared_storage}/{self.task_id}/report"
        shared_storage_source = os.environ.get('DOMINO_WORKFLOW_SHARED_STORAGE', None)
        if not shared_storage_source or shared_storage_source == "none" or self.deploy_mode == "local-compose":
            self.generate_paths()
        else:
            self._wait_for_sidecar_paths()
            
        # Using pydantic to validate input data
        input_model_obj = piece_input_model(**op_kwargs)

        # Run piece function
        output_obj = self.piece_function(input_model=input_model_obj)

        # Validate output data
        if not isinstance(output_obj, piece_output_model):
            raise InvalidPieceOutputError(piece_name=self.__class__.__name__)

        # Push XCom
        xcom_obj = self.format_xcom(output_obj=output_obj)
        self.push_xcom(xcom_obj=xcom_obj)


    @classmethod
    def dry_run(
        cls,
        piece_input: dict, 
        piece_input_model: pydantic.BaseModel,
        piece_output_model: pydantic.BaseModel, 
        piece_secrets_model: pydantic.BaseModel = None,
        secrets_input: dict = None,
        results_path: str = None,
    ):
        # Instantiate 
        input_model_obj = piece_input_model(**piece_input)
        secrets_model_obj = piece_secrets_model(**secrets_input) if piece_secrets_model else None

        class DryPiece(cls):
            def __init__(self, secrets, results_path):
                self.results_path = results_path
                self.secrets = secrets
                self.logger = get_configured_logger(f"{self.__class__.__name__ }-dry-run")

        dry_instance = DryPiece(
            secrets=secrets_model_obj,
            results_path=results_path
        )

        # Run piece function
        return cls.piece_function(self=dry_instance, input_model=input_model_obj)

    @staticmethod
    def get_container_cpu_limit() -> float:
        """
        Get the CPU limit of the container in millicores.
        reference: https://stackoverflow.com/questions/65551215/get-docker-cpu-memory-limit-inside-container/65554131#65554131
        """
        with open("/sys/fs/cgroup/cpu/cpu.cfs_quota_us") as fp:
            cfs_quota_us = int(fp.read())
        with open("/sys/fs/cgroup/cpu/cpu.cfs_period_us") as fp:
            cfs_period_us = int(fp.read())

        container_cpus = float(cfs_quota_us / cfs_period_us)
        return container_cpus

    @staticmethod
    def get_nvidia_smi_output() -> str:
        """
        Get the output of nvidia-smi command.
        """
        try:
            nvidia_smi_output = subprocess.check_output(["nvidia-smi", "-q"])
            return nvidia_smi_output
        except Exception as e:
            raise Exception(f"Error while running nvidia-smi: {e}")

    @staticmethod
    def get_container_memory_limit() -> int:
        """
        Get the memory limit of the container in bytes.
        """
        with open("/sys/fs/cgroup/memory/memory.limit_in_bytes") as fp:
            container_memory_limit = int(fp.read())
        return container_memory_limit

    @staticmethod
    def get_container_memory_usage() -> int:
        """
        Get the memory usage of the container in bytes.
        """
        with open("/sys/fs/cgroup/memory/memory.usage_in_bytes") as fp:
            container_memory_usage = int(fp.read())
        return container_memory_usage


    @abc.abstractmethod
    def piece_function(self):
        """
        This function carries the relevant code for the Piece run.
        It should have all the necessary content for auto-generating json schemas.
        All arguments should be type annotated and docstring should carry description for each argument.
        """
        raise NotImplementedError("This method must be implemented in the child class!")        

    
    def generate_report(self):
        """This function carries the relevant code for the Piece report."""
        raise NotImplementedError("This method must be implemented in the child class!")
