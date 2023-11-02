
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from datetime import datetime

class GetAssembledPieceResponse(BaseModel):
    id: int = Field(..., description="Assembled piece database id")
    name: str = Field(..., description="Name of the assembled piece")
    workflow_id: str = Field(..., description="Workflow id of the assembled piece")
    description: Optional[str] = Field(None, description="Description of the assembled piece")
    dependency: Optional[dict] = Field(None, description="Dependency of the assembled piece")
    input_schema: dict = Field(..., description="Input schema of the assembled piece")
    output_schema: dict = Field(..., description="Output schema of the assembled piece")
    secrets_schema: dict = Field(..., description="Secrets schema of the assembled piece")
    style: Optional[dict] = Field(None, description="Style of the assembled piece")
    

class GetAssembledPiecesResponse(BaseModel):
    assembled_pieces: List[GetAssembledPieceResponse] = Field(..., description="List of assembled pieces")

