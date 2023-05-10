import subprocess
from typing import List, Union, Tuple
import ast
import os
from pathlib import Path
import configparser
import time
import sys
import re
from logger import get_configured_logger

class SharedStorageMount(object):
    def __init__(self):
        self.logger = get_configured_logger(self.__class__.__name__)
        self.mount_base_path = "/home/shared_storage"
        self.config_file_path = "/.config/rclone/rclone.conf"
        self.parser = self._get_parser()
        self._set_shared_storage()
        self._set_remote_base_folder_path()
        self.task_id = ast.literal_eval(os.environ.get("DOMINO_K8S_INSTANTIATE_PIECE_KWARGS"))["task_id"]
        self.workflow_run_subpath = os.environ.get("DOMINO_WORKFLOW_RUN_SUBPATH")

        self.shared_storage_function_map = {
            "gcs": self._setup_gcs_shared_storage_config,
            "aws_s3": self._setup_aws_s3_shared_storage_config,
            "local": self._setup_local_shared_storage_config
        }
        self._setup_shared_storage()

    def _setup_local_shared_storage_config(self):
        raise NotImplementedError("Local is not implemented yet")

    def _setup_gcs_shared_storage_config(self):
        raise NotImplementedError("GCS is not implemented yet")

    def _setup_aws_s3_shared_storage_config(self):
        aws_access_key_id = self.workflow_shared_storage_secrets.get("AWS_ACCESS_KEY_ID", None)
        aws_secret_access_key = self.workflow_shared_storage_secrets.get("AWS_SECRET_ACCESS_KEY", None)
        aws_region_name = self.workflow_shared_storage_secrets.get("AWS_REGION_NAME", None)
        if aws_access_key_id is None or aws_secret_access_key is None or aws_region_name is None:
            raise Exception("AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY or AWS_REGION_NAME is not set")

        bucket = self.workflow_shared_storage.get("bucket", None)
        self.parser.set("aws_s3", "env_auth", 'false')
        self.parser.set("aws_s3", "access_key_id", aws_access_key_id)
        self.parser.set("aws_s3", "secret_access_key", aws_secret_access_key)
        self.parser.set("aws_s3", "region", aws_region_name)

        # Update rclone config file with this session details
        with open(self.config_file_path, "w+") as f:
            self.parser.write(f)

        self.rclone_base_path = f"{self.shared_storage_source_name}:{bucket}{self.remote_base_folder_path}{self.workflow_run_subpath}"

    def _setup_shared_storage(self):
        self.shared_storage_function_map[self.shared_storage_source_name]()

    def _set_shared_storage(self):
        self.workflow_shared_storage = ast.literal_eval(os.environ.get("DOMINO_WORKFLOW_SHARED_STORAGE", {}))
        self.workflow_shared_storage_secrets = ast.literal_eval(os.environ.get("DOMINO_WORKFLOW_SHARED_STORAGE_SECRETS", {}))
        self.shared_storage_source_name = self.workflow_shared_storage.get("source", None)
        self.shared_storage_mode = self.workflow_shared_storage.get("mode", None)

        if self.shared_storage_source_name is None:
            raise Exception("SHARED_STORAGE_SOURCE_NAME is not set")
        if self.shared_storage_mode is None:
            raise Exception("Shared Storage Mode is not set")

    def _set_remote_base_folder_path(self):
        self.remote_base_folder_path = self.workflow_shared_storage.get("base_folder", "/")
        if self.remote_base_folder_path == "":
            self.remote_base_folder_path = "/"
        if self.remote_base_folder_path[-1] != "/":
            self.remote_base_folder_path += "/"
        if self.remote_base_folder_path[0] != "/":
            self.remote_base_folder_path = "/" + self.remote_base_folder_path

    def _get_parser(self):
        parser = configparser.ConfigParser()
        parser.read(self.config_file_path)
        return parser

    def _mount_upstreams(self, shared_storage_upstream_ids_list: List[str]):
        self.logger.info("Mounting upstreams: %s", shared_storage_upstream_ids_list)
        for upstream_id in shared_storage_upstream_ids_list:
            upstream_mount_dir_path = Path(self.mount_base_path) / upstream_id
            upstream_mount_dir_path.mkdir(parents=True, exist_ok=True)
            subprocess.run([
                "rclone", 
                "mount",  
                f"{self.rclone_base_path}/{upstream_id}", 
                f"{self.mount_base_path}/{upstream_id}", 
                "--allow-other",              # Allow other users to access the mount - might be needed for the other container
                "--allow-non-empty",          # Allow mounting over a non-empty directory
                "--daemon",                   # Run in background
                "--vfs-cache-mode", "full",   # Cache all read and written files on disk
                "--vfs-cache-max-age", "2h",  # Cache files for up to 2 hours
                "--read-only",                # Read only 
                "--config", self.config_file_path  # Use updated config file
            ])

    def _unmount_upstreams(self, shared_storage_upstream_ids_list: List[str]):
        self.logger.info("Unmounting upstreams: %s", shared_storage_upstream_ids_list)
        for upstream_id in shared_storage_upstream_ids_list:
            self.logger.info(f'Checking if mount is busy for upstream {upstream_id}')
            self._check_mount_busy(task_id=upstream_id)

            out = False
            while not out:
                r = subprocess.run(
                    ["fusermount", "-u", f"{self.mount_base_path}/{upstream_id}"], 
                    stdout=subprocess.PIPE, 
                    stderr=subprocess.PIPE, text=True
                )
                self.logger.info(r.stdout)
                if r.stderr:
                    self.logger.error(f"Unmounting failed for upstream {upstream_id}, trying again in 2 seconds")
                    self.logger.error(r.stderr)
                time.sleep(2)
                out = r.returncode == 0
    
    @staticmethod
    def _parse_stdout_rclone_check(stdout_message: str) -> Tuple[Union[int, None], Union[int, None]]:
        matching_files_number = re.search(r': (\d+) matching', stdout_message)
        if matching_files_number:
            matching_files_number = int(matching_files_number.group(1))
        else:
            matching_files_number = 0

        differences_files_number = re.search(r': (\d+) differences', stdout_message)
        if differences_files_number:
            differences_files_number = int(differences_files_number.group(1))
        
        return matching_files_number, differences_files_number

    def _check_mount_busy(self, task_id: str):
        self.logger.info("Checking if mount is busy...")
        source_mount_path = str(Path(self.mount_base_path) / task_id)
        destination_mount_path = str(Path(self.rclone_base_path) / task_id)
        command = ['rclone', 'check', f'{source_mount_path}', f'{destination_mount_path}', '--size-only', '--one-way', "--config", self.config_file_path]
        shared_storage_files_paths = [os.path.join(root, filename) for root, _, filenames in os.walk(source_mount_path) for filename in filenames]

        while True:
            subprocess_output = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            matching_files_number, differences_files_number = self._parse_stdout_rclone_check(subprocess_output.stderr.decode('utf-8'))
            if len(shared_storage_files_paths) == matching_files_number and differences_files_number == 0:
                break
            self.logger.info("Mount is busy, waiting to unmount.")
            time.sleep(2)
        self.logger.info('Mount is ready to unmount.')

    def mount(self):
        shared_storage_upstream_ids_list = ast.literal_eval(os.environ.get("AIRFLOW_UPSTREAM_TASKS_IDS_SHARED_STORAGE", "[]"))
        self._mount_upstreams(shared_storage_upstream_ids_list)

        if self.shared_storage_mode == 'Read':
            # If the shared storage is read only, we don't need to mount the current task. The pod only need access to the upstreams data
            return

        self.logger.info("Mounting task: %s", self.task_id)
        command = [
            "rclone", 
            "mount",  
            f"{self.rclone_base_path}/{self.task_id}", 
            f"{self.mount_base_path}/{self.task_id}", 
            "--allow-other",              # Allow other users to access the mount - might be needed for the other container
            "--allow-non-empty",          # Allow mounting over a non-empty directory
            "--daemon",                   # Run in background       
            "--vfs-cache-mode", "full",   # Cache all read and written files on disk
            "--vfs-cache-max-age", "2h",  # Cache files for up to 2 hours
            "--config", self.config_file_path  # Use updated config file
        ]
        self.logger.info("Mount command: %s", " ".join(command))
        subprocess.run(command, stdout=subprocess.PIPE)
        self.generate_paths(task_id=self.task_id)
        self.logger.info("Mount daemon process running")

    def unmount(self):
        self.logger.info('Unmounting task: %s', self.task_id)
        shared_storage_upstream_ids_list = ast.literal_eval(os.environ.get("AIRFLOW_UPSTREAM_TASKS_IDS_SHARED_STORAGE", "[]"))
        self._unmount_upstreams(shared_storage_upstream_ids_list)

        self._check_mount_busy(task_id=self.task_id)
        out = False
        while not out:
            r = subprocess.run(
                ["fusermount", "-u", f"{self.mount_base_path}/{self.task_id}"], 
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE, text=True
            )
            self.logger.info(r.stdout)
            if r.stderr:
                self.logger.error("Unmounting failed, trying again in 2 seconds")
                self.logger.error(r.stderr)
            time.sleep(2)
            out = r.returncode == 0
    
    def generate_paths(self, task_id: str):
        """
        Generate paths to store results, xcom and report data.
            workflow_shared_storage: str - Base path to shared storage
            task_id: str - Task ID
        """
        self.logger.info("Generating paths")
        if not Path(f"{self.mount_base_path}/{task_id}").is_dir():
            Path(f"{self.mount_base_path}/{task_id}").mkdir(parents=True, exist_ok=True)

        # Path to store results data
        results_path = f"{self.mount_base_path}/{task_id}/results"
        if not Path(results_path).is_dir():
            Path(results_path).mkdir(parents=True, exist_ok=True)
        
        # Path to store XCOM data - XCOM data is saved here AND also at /airflow/xcom/return.json
        xcom_path = f"{self.mount_base_path}/{task_id}/xcom"
        if not Path(xcom_path).is_dir():
            Path(xcom_path).mkdir(parents=True, exist_ok=True)
        
        # Path to store report data
        report_path = f"{self.mount_base_path}/{task_id}/report"
        if not Path(report_path).is_dir():
            Path(report_path).mkdir(parents=True, exist_ok=True)


if __name__ == '__main__':
    """
    Execute mount or unmount based on the first argument passed to the script.
    """
    shared_storage_mount = SharedStorageMount()
    getattr(shared_storage_mount, sys.argv[1])()
