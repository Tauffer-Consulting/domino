from pydantic import BaseModel
from typing import List
from database.models.enums import Permission, RepositorySource


class CreateWorkspaceResponse(BaseModel):
    id: int
    name: str


class WorkspaceBase(BaseModel):
    workspace_id: int
    workspace_name: str
    user_permission: Permission


class WorkspaceWorkflows(BaseModel):
    workflow_id: int


class WorkspaceRepositories(BaseModel):
    repository_id: int
    repository_source: RepositorySource
    repository_name: str


class WorkspaceUsers(BaseModel):
    user_id: int
    permission: Permission


class AssignWorkspaceResponse(BaseModel):
    user_id: int
    workspaces: List[WorkspaceBase]


class ListUserWorkspacesResponse(BaseModel):
    id: int
    workspace_name: str
    user_permission: Permission
    github_access_token_filled: bool


class GetWorkspaceResponse(BaseModel):
    id: int
    workspace_name: str
    user_permission: str
    github_access_token_filled: bool

class PatchWorkspaceResponse(GetWorkspaceResponse):
    ...