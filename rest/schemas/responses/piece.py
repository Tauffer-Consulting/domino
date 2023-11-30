from pydantic import BaseModel, Field
from typing import Dict, List, Optional


class GetPiecesResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    dependency: Optional[Dict] = None
    source_image: Optional[str] = None
    input_schema: Optional[Dict] = None
    output_schema: Optional[Dict] = None
    secrets_schema: Optional[Dict] = None
    container_resources: Optional[Dict] = None
    tags: Optional[List[str]] = None
    style: Optional[Dict] = None
    source_url: Optional[str] = None
    repository_url: str
    repository_id: int