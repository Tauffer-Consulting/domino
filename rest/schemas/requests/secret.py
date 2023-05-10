from typing import Optional
from pydantic import BaseModel, Field
from pydantic import SecretStr


class CreateWorkspaceRepositoryRequest(BaseModel):
    name: str = Field(..., description="Name of the secret")
    value: SecretStr = Field(..., description="Secret value")

class PatchSecretValueRequest(BaseModel):
    value: Optional[SecretStr] = Field(description='Secret value', default=None)