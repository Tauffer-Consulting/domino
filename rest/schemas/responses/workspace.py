from pydantic import BaseModel
from typing import List
from database.models.enums import Permission, RepositorySource, UserWorkspaceStatus
from schemas.responses.base import PaginationSet


class CreateWorkspaceResponse(BaseModel):
    id: int
    name: str
    user_permission: Permission


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
    status: UserWorkspaceStatus
    github_access_token_filled: bool


class ListWorkspaceUsersResponseData(BaseModel):
    user_id: int
    user_email: str
    user_permission: Permission
    status: UserWorkspaceStatus
    

class ListWorkspaceUsersResponse(BaseModel):
    data: List[ListWorkspaceUsersResponseData]
    metadata: PaginationSet


class GetWorkspaceResponse(BaseModel):
    id: int
    workspace_name: str
    user_permission: str
    status: UserWorkspaceStatus
    github_access_token_filled: bool

class PatchWorkspaceResponse(GetWorkspaceResponse):
    ...