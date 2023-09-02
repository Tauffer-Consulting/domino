from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional


class StorageSource(str, Enum):
    none = "None"
    local = 'Local'
    aws_s3 = "AWS S3"


class StorageMode(str, Enum):
    none = 'None'
    read = 'Read'
    write = 'Write'
    read_write = 'Read/Write'


class WorkflowSharedStorage(BaseModel):
    source: StorageSource = Field(
        description="The service to be used as the source of storage.", 
        default="none",
    )
    mode: StorageMode = Field(
        description="The access mode to the storage source.", 
        default="none"
    )
    default_piece_name: str = Field(
        description="The name of the default piece to be used for the storage source.",
    )


class LocalSharedStorage(WorkflowSharedStorage):
    source = StorageSource.local
    default_piece_name: str = "LocalDefaultOperator" # TODO to be implemented


class AwsS3SharedStorage(WorkflowSharedStorage):
    source = StorageSource.aws_s3
    bucket: str = Field(
        description="The name of the bucket to be used as the root of the storage source."
    )
    default_piece_name: str = "AWSS3DefaultPiece"
    base_folder: str = Field(
        description="The base folder to be used as the root of the storage source.",
        default="",
    )
    storage_repository_id: int = Field(
        description="The id of the storage repository to be used as the root of the storage source.",
    )


shared_storage_map = {
    "none": None,
    "local": LocalSharedStorage,
    "aws_s3": AwsS3SharedStorage,
}