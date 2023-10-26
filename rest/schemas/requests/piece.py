from pydantic import BaseModel
from typing import Optional

class ListPiecesFilters(BaseModel):
    name__like: Optional[str]

class CreatePieceRequest(BaseModel):
    name: str
    description: Optional[str]
    dependency: Optional[dict]
    source_image: Optional[str]
    input_schema: Optional[dict]
    output_schema: Optional[dict]
    secrets_schema: Optional[dict]
    style: Optional[dict]
    source_url: Optional[str]
    repository_id: int
    is_compose: bool = False