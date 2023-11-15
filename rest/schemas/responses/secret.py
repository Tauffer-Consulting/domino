from pydantic import BaseModel
from typing import List, Optional


class Secret(BaseModel):
    name: str


class CreateSecretResponse(BaseModel):
    workspace_id: int
    repository_id: int
    secrets: List[Secret]


class ListRepositorySecretsResponse(BaseModel):
    id: int
    name: str
    is_filled: bool

class GetSecretsByPieceResponse(BaseModel):
    name: str
    value: Optional[str] = None
    required: bool