from pydantic import BaseModel, Field
from typing import Optional
from database.models.enums import RepositorySource
import enum


class RepositorySourceRequestEnum(str, enum.Enum):
    github = 'github'
    class Config:
        use_enum_values = True

class ListRepositoryFilters(BaseModel):
    name__like: Optional[str]
    path_like: Optional[str]
    version: Optional[str]
    url: Optional[str]
    workspace_id: Optional[int]
    source: Optional[RepositorySource] = Field(description="Source of the repository.", default=RepositorySource.github.value)

class CreateRepositoryRequest(BaseModel):
    workspace_id: int = Field(description='Workspace id to create repository')
    source: RepositorySourceRequestEnum = Field(description="Source of the repository", default=RepositorySource.github.value)
    path: str = Field(..., description="Path to the repository. If local source, this is the absolute path to the repository folder. If github source, this is the repository name.")
    version: str = Field(regex=r'((^\d+\.\d+\.\d+$))', description="Version of the repository.")

class PatchRepositoryRequest(BaseModel):
    version: str = Field(regex=r'((^\d+\.\d+\.\d+$))', description="Version of the repository.")