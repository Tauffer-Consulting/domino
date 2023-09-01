import boto3
import os
from botocore.exceptions import ClientError
from domino.logger import get_configured_logger


class S3Client(object):
    def __init__(self, bucket_name):
        """
        Credentials & configuration are handled in .aws directory or environment variables
        """
        self.s3r = boto3.resource('s3')
        self.logger = get_configured_logger(self.__class__.__name__)
        self.set_bucket(bucket_name)

    def set_bucket(self, bucket_name):
        """
        boto3.resource("s3").Bucket reference:
        https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html#bucket
        """
        try:
            self.bucket = self.s3r.Bucket(bucket_name)
        except ClientError as e:
            self.logger.exception(e)

    def download_file_from_s3_folder(self, object_key: str, file_path: str):
        """ref: https://boto3.amazonaws.com/v1/documentation/api/1.9.42/reference/services/s3.html#S3.Bucket.download_file"""
        self.bucket.download_file(
            Key=object_key, 
            Filename=file_path
        )
    
    def download_file_from_s3_folder_as_bytes(self, object_key: str):
        """ref: https://stackoverflow.com/a/48696641/11483674"""
        s3_object = self.bucket.Object(object_key)
        return s3_object.get()["Body"]

    def download_s3_folder(self, s3_folder, local_dir=None):
        """
        Download the contents of a S3 folder, with sub-directories
        ref: https://stackoverflow.com/a/62945526/11483674
        
        Args:
            bucket_name: the name of the s3 bucket
            s3_folder: the folder path in the s3 bucket
            local_dir: a relative or absolute directory path in the local file system
        """
        try:
            for obj in self.bucket.objects.filter(Prefix=s3_folder):
                target = obj.key if local_dir is None \
                    else os.path.join(local_dir, os.path.relpath(obj.key, s3_folder))
                if not os.path.exists(os.path.dirname(target)):
                    os.makedirs(os.path.dirname(target))
                if obj.key[-1] == '/':
                    continue
                self.bucket.download_file(obj.key, target)
            return None
        except ClientError as e:
            self.logger.exception(e)
            return str(e)
    
    def list_objects_from_bucket(self):
        return [o for o in self.bucket.objects.filter()]

    def upload_file_to_s3(self, object_key: str, file_path: str):
        """ref: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html#S3.Bucket.upload_file"""
        self.bucket.upload_file(
            Filename=file_path,
            Key=object_key
        )