from pydantic import BaseModel, Field
from typing import List, Dict


class Dependency(BaseModel):
    docker_image: str = Field(
        description="Docker image to be used to run this Operator", 
        json_schema_extra={
            "example": "python:3.9-slim"
        },
        default=None
    )
    dockerfile: str = Field(
        description="Dockerfile to build the image for the container that will run this Operator", 
        json_schema_extra={
            "example": "Dockerfile"
        },
        default=None
    )
    requirements_file: str = Field(
        description="Requirements file with pip packages to be installed in the container that will run this Operator", 
        json_schema_extra={
            "example": "requirements.txt"
        },
        default=None
    )
    # TODO - validation: one and only one of these options


class InputSchema(BaseModel):
    title: str
    description: str
    type: str
    properties: Dict


class OutputSchema(BaseModel):
    title: str
    description: str
    type: str
    properties: Dict


class SecretsSchema(BaseModel):
    title: str
    description: str
    type: str
    properties: Dict


class PieceMetadata(BaseModel):
    name: str = Field(
        description="Piece name", 
        json_schema_extra={
            "example": "ExamplePiece"
        } 
    )
    description: str = Field(
        description="Description of this Piece", 
        json_schema_extra={
            "example": "This Piece executes ABCDEFG function."
        } 
    )
    dependency: Dependency = None
    container_resources: Dict = None # TODO - add model for the container_resources dictionary
    tags: List[str] = None
    style: Dict = None # TODO - add model for the style dictionary
    input_schema: InputSchema = None
    output_schema: OutputSchema = None
    secrets_schema: SecretsSchema = None
    source_url: str = None