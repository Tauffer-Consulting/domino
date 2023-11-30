from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from database.models.enums import RepositorySource
from schemas.responses.base import PaginationSet

class GetWorkspaceRepositoriesData(BaseModel):
    id: int
    created_at: datetime
    name: str
    label: str
    source: RepositorySource
    path: Optional[str] = None
    version: Optional[str] = None
    workspace_id: int

class GetWorkspaceRepositoriesResponse(BaseModel):
    data: List[GetWorkspaceRepositoriesData]
    metadata: PaginationSet

class RepositorySecret(BaseModel):
    id: int
    name: str

class CreateRepositoryReponse(BaseModel):
    id: int = Field(..., description='Repository database id')
    name: str = Field(..., description="Name of the repository")
    created_at: datetime = Field(..., description="Date of creation")
    source: RepositorySource = Field(..., description="Source of the repository")
    label: str = Field(..., description="Label of the repository")
    path: str = Field(..., description="Path of the repository")
    version: Optional[str] = Field(default=None, description="Version of the repository")
    workspace_id: int = Field(..., description="Workspace id the repository belongs to")


class PatchRepositoryResponse(CreateRepositoryReponse):
    ...

class GetRepositoryReleasesResponse(BaseModel):
    version: str
    last_modified: str


class GetRepositoryReleaseDataResponse(BaseModel):
    name: str
    description: Optional[str] = None
    pieces: List[str]

class GetRepositoryResponse(BaseModel):
    id: int
    created_at: datetime
    name: str
    source: RepositorySource
    path: Optional[str] = None
    version: Optional[str] = None
    workspace_id: int