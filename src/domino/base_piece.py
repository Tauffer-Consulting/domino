import abc
import json
import os
import ast
from datetime import datetime
from pathlib import Path
from typing import Union
import pydantic
import pickle
import time
import subprocess
import base64
from typing import Optional

from domino.logger import get_configured_logger
from domino.schemas import DeployModeType, DisplayResultFileType
from domino.exceptions.exceptions import InvalidPieceOutputError


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

        self.display_result = None
        self._shared_storage_usage_in_bytes = 0

    def start_logger(self):
        """
        Start logger.
        """
        self.logger.info(f"Started {self.task_id} of type {self.__class__.__name__} at {str(datetime.now().isoformat())}")
        self.logger.info("Start cut point for logger 48c94577-0225-4c3f-87c0-8add3f4e6d4b")

    def _wait_for_sidecar_paths(self):
        # Wait for sidecar create directories
        while True:
            if Path(self.report_path).is_dir():
                break
            time.sleep(2)

    @staticmethod
    def _get_folder_size(folder_path):
        total_size = 0
        for dirpath, _, filenames in os.walk(folder_path):
            for filename in filenames:
                file_path = os.path.join(dirpath, filename)
                total_size += os.path.getsize(file_path)
        return total_size

    def generate_paths(self):
        """
        Generates paths for shared storage.
        """
        # Base path for fetching and storing runs results
        if not Path(self.workflow_shared_storage_path).is_dir():
            Path(self.workflow_shared_storage_path).mkdir(parents=True, exist_ok=True)

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
                self.upstream_tasks_data[tid]["results"] = self.workflow_shared_storage_path + f"/{tid}/results"
                with open(f"{self.workflow_shared_storage_path}/{tid}/xcom/return.json") as f:
                    self.upstream_tasks_data[tid]["xcom"] = json.load(f)
        else:
            raise NotImplementedError(f"Get upstream XCOM not implemented for deploy_mode=={self.deploy_mode}")

    def validate_and_get_env_secrets(self, piece_secrets_model: pydantic.BaseModel = None):
        """
        Get secret variables for this Piece from ENV. The necessary secret variables to run the Piece should be defined in the Piece's SecretsModel.
        The secrets can then be retrieved and used in the Piece's `piece_function` method.

        Args:
            piece_secrets_model (pydantic.BaseModel): _description_
        """
        if piece_secrets_model:
            secrets_values = ast.literal_eval(os.environ.get('DOMINO_PIECE_SECRETS', '{}'))
            return piece_secrets_model(**secrets_values)
        return None

    def format_xcom(self, output_obj: pydantic.BaseModel) -> dict:
        """
        Formats and adds extra metadata to XCOM dictionary content.

        Args:
            output_obj (dict): Pydantic output model

        Returns:
            dict: XCOM dictionary
        """
        # xcom_obj = output_obj.model_dump()
        xcom_obj = json.loads(output_obj.model_dump_json())
        if not isinstance(xcom_obj, dict):
            self.logger.info(f"Piece {self.__class__.__name__} is not returning a valid XCOM object. Auto-generating a base XCOM for it...")
            xcom_obj = dict()

        # Serialize self.display_result and add it to XCOM
        if isinstance(self.display_result, dict):
            if "file_type" not in self.display_result:
                raise Exception("display_result must have 'file_type' key")
            if "base64_content" not in self.display_result:
                if "file_path" not in self.display_result:
                    raise Exception("self.display_result dict must have either 'file_path' or 'base64_content' keys")
                self.display_result["base64_content"] = self.serialize_display_result_file(
                    file_path=self.display_result["file_path"],
                    file_type=self.display_result["file_type"]
                )
            self.display_result["file_path"] = str(self.display_result.get("file_path", None))
            self.display_result["file_type"] = str(self.display_result["file_type"])
        else:
            raw_content = f"Piece {self.__class__.__name__} did not return a valid display_result."
            base64_content = base64.b64encode(raw_content.encode("utf-8")).decode("utf-8")
            self.display_result = dict()
            self.display_result["file_path"] = None
            self.display_result["file_type"] = "txt"
            self.display_result["base64_content"] = base64_content

        xcom_obj["display_result"] = self.display_result

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

        else:
            raise NotImplementedError("deploy mode not accepted for xcom push")

    def run_piece_function(
        self,
        piece_input_data: dict,
        piece_input_model: pydantic.BaseModel,
        piece_output_model: pydantic.BaseModel,
        piece_secrets_model: Optional[pydantic.BaseModel] = None,
        airflow_context: Optional[dict] = None
    ):
        """
        _summary_

        Args:
            piece_input_data (dict): Dictionary containing Piece's Input kwargs
            piece_input_model (pydantic.BaseModel): Piece's InputModel
            piece_output_model (pydantic.BaseModel): Piece's OutputModel
            piece_secrets_model (pydantic.BaseModel, optional): Piece's SecretsModel. Defaults to None.
            airflow_context (dict, optional): Airflow context dictionary. Defaults to None.

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
        if airflow_context is None:
            self.airflow_context = {
                "execution_datetime": os.getenv('AIRFLOW_CONTEXT_EXECUTION_DATETIME', "123456789"),
                "dag_run_id": os.getenv('AIRFLOW_CONTEXT_DAG_RUN_ID', "123456789"),
            }

        # Check if Piece's necessary secrets are present in ENV
        secrets_model_obj = self.validate_and_get_env_secrets(piece_secrets_model=piece_secrets_model)

        # Generate paths
        workflow_run_subpath = os.environ.get('DOMINO_WORKFLOW_RUN_SUBPATH', '')
        self.workflow_shared_storage_path = Path("/home/shared_storage")
        if self.deploy_mode == 'local-compose':
            self.workflow_shared_storage_path = str(self.workflow_shared_storage_path / workflow_run_subpath)
        self.results_path = f"{self.workflow_shared_storage_path}/{self.task_id}/results"
        self.xcom_path = f"{self.workflow_shared_storage_path}/{self.task_id}/xcom"
        self.report_path = f"{self.workflow_shared_storage_path}/{self.task_id}/report"
        shared_storage_source_name = os.environ.get('DOMINO_WORKFLOW_SHARED_STORAGE_SOURCE_NAME', None)
        if not shared_storage_source_name or shared_storage_source_name == "none" or self.deploy_mode == "local-compose":
            self.generate_paths()
        else:
            self._wait_for_sidecar_paths()

        # Using pydantic to validate input data
        input_model_obj = piece_input_model(**piece_input_data)

        # Run piece function
        call_piece_func_dict = {"input_data": input_model_obj}
        if piece_secrets_model:
            call_piece_func_dict['secrets_data'] = secrets_model_obj
        output_obj = self.piece_function(**call_piece_func_dict)

        # Validate output data
        if isinstance(output_obj, dict):
            output_obj = piece_output_model(**output_obj)
        if not isinstance(output_obj, piece_output_model):
            raise InvalidPieceOutputError(piece_name=self.__class__.__name__)

        # Push XCom
        xcom_obj = self.format_xcom(output_obj=output_obj)
        shared_storage_base_path = f"{self.workflow_shared_storage_path}/{self.task_id}"
        self._shared_storage_usage_in_bytes = self._get_folder_size(shared_storage_base_path)
        xcom_obj['_shared_storage_usage_in_bytes'] = self._shared_storage_usage_in_bytes
        self.push_xcom(xcom_obj=xcom_obj)
        self.logger.info(f"Piece used {self._shared_storage_usage_in_bytes} bytes of storage.")
        self.logger.info("End cut point for logger 48c94577-0225-4c3f-87c0-8add3f4e6d4b")


    @classmethod
    def dry_run(
        cls,
        input_data: dict,
        piece_input_model: pydantic.BaseModel,
        piece_output_model: pydantic.BaseModel,
        piece_secrets_model: pydantic.BaseModel = None,
        secrets_data: dict = None,
        results_path: str = None,
    ):
        # Instantiate models
        input_model_obj = piece_input_model(**input_data)
        secrets_model_obj = piece_secrets_model(**secrets_data) if piece_secrets_model else None

        class DryPiece(cls):
            def __init__(self, results_path):
                self.results_path = results_path
                self.logger = get_configured_logger(f"{self.__class__.__name__ }-dry-run")

        dry_instance = DryPiece(results_path=results_path)

        # Run piece function
        call_piece_func_dict = {
            "self": dry_instance,
            "input_data": input_model_obj
        }
        if piece_secrets_model:
            call_piece_func_dict['secrets_data'] = secrets_model_obj
        output_obj = cls.piece_function(**call_piece_func_dict)

        # Validate output data
        if isinstance(output_obj, dict):
            output_obj = piece_output_model(**output_obj)
        if not isinstance(output_obj, piece_output_model):
            raise InvalidPieceOutputError(piece_name=cls.__name__)

        return output_obj

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

    def serialize_display_result_file(self, file_path: Union[str, Path], file_type: DisplayResultFileType) -> dict:
        """
        Serializes the content of 'display_result_file' into base64 string, to fit Airflow XCOM.

        Args:
            file_path (Union[str, Path]): The path to the file.
            file_type (DisplayResultFileType): The type of the file.

        Returns:
            dict: A dictionary containing the base64-encoded content and the file type.
        """
        if not Path(file_path).exists():
            self.logger.info(f"File {file_path} does not exist. Skipping serialization...")
            return None
        if not Path(file_path).is_file():
            self.logger.info(f"Path {file_path} is not a file. Skipping serialization...")
            return None
        # Read file content as bytes and encode content into base64
        with open(file_path, "rb") as f:
            content_bytes = f.read()
        encoded_content = base64.b64encode(content_bytes).decode('utf-8')
        return encoded_content

    # @abc.abstractmethod
    # def generate_report(self):
    #     """This function carries the relevant code for the Piece report."""
    #     raise NotImplementedError("This method must be implemented in the child class!")
