from pydantic import BaseModel, Field
from typing import Dict, List, Optional


class GetPiecesResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    dependency: Optional[Dict]
    source_image: Optional[str]
    input_schema: Optional[Dict]
    output_schema: Optional[Dict]
    secrets_schema: Optional[Dict]
    style: Optional[Dict]
    source_url: Optional[str]
    repository_id: int

class CreatePieceResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    dependency: Optional[Dict]
    source_image: Optional[str]
    input_schema: Optional[Dict]
    output_schema: Optional[Dict]
    secrets_schema: Optional[Dict]
    style: Optional[Dict]
    source_url: Optional[str]
    repository_id: int
    is_compose: bool 