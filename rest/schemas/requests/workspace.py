from pydantic import BaseModel, Field, SecretStr
from typing import Optional
from database.models.enums import Permission

class CreateWorkspaceRequest(BaseModel):
    name: str = Field(..., description="Name of the workspace")
    

class PatchWorkspaceRequest(BaseModel):
    github_access_token: Optional[str] = Field(description='Secret value', default=None)

class AssignWorkspaceRequest(BaseModel):
    permission: Permission
    user_email: str = Field(..., description="Email of the user to be assigned to the workspace")