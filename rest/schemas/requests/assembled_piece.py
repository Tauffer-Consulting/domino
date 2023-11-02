
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CreateAssembledPieceRequest(BaseModel):
    name: str = Field(..., description="Name of the assembled piece.")
    workflow_id:str = Field(..., description="Workflow id of the assembled piece.")
    description: Optional[str] = Field(None, description="Description of the assembled piece.")
    dependency: Optional[dict] = Field(None, description="Dependency of the assembled piece.")
    input_schema: dict = Field(..., description="Input schema of the assembled piece.")
    output_schema: dict = Field(..., description="Output schema of the assembled piece.")
    secrets_schema: dict = Field(..., description="Secrets schema of the assembled piece.")
    style: Optional[dict] = Field(None, description="Style of the assembled piece.")

class ListAssembledPiecesFilters(BaseModel):
    name__like: Optional[str]
    workflow_id: Optional[int]