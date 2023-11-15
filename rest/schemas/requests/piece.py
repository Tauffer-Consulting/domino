from pydantic import BaseModel
from typing import Optional
from schemas.requests.workflow import CreateWorkflowRequest

class ListPiecesFilters(BaseModel):
    name__like: Optional[str] = None

class create_piece(BaseModel):
    repository_name: str
    name: str
    description: Optional[str] = None
    dependency: Optional[dict] = None
    source_image: Optional[str] = None
    input_schema: dict
    output_schema: dict
    secrets_schema: dict
    style: Optional[dict] = None
    source_url: Optional[str] = None
    repository_id: int
    is_composite: bool = True
    
class CreatePieceRequest(CreateWorkflowRequest):
    piece: create_piece