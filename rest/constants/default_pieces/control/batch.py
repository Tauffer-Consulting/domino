from pydantic import BaseModel, Field, PositiveInt
from typing import List, Union, Optional
from datetime import datetime



class InputModel(BaseModel):
    batch_over: List[Union[str, int, float, bool, dict, datetime]] = Field(
        title='Batch Over',
        description='List to iterate over',
        json_schema_extra={"from_upstream": "always"}
    )
    max_concurrency: PositiveInt = Field(
        title='Max Concurrency',
        description='Max number of parallel executions'
    )

class OutputMode(BaseModel):
    output: List[Union[str, int, float, bool, dict, datetime]] = Field(
        title='Output',
        description='Output of the batch',
    ) # TODO use output modifier?

batch_piece_default_style = {
    "label": "Batch Piece",
    "iconClassName": "ic:baseline-loop",
    "nodeType": "control",
}
class BatchPiece(BaseModel):
    name: str = Field(title='Name', default='BatchPiece')
    description: str = Field(title='Description', default='Piece to run batch processing with concurrency.')
    input_schema: dict = Field(default=InputModel.model_json_schema())
    secrets_schema: Optional[dict] = Field(default=None)
    style: dict = Field(default=batch_piece_default_style)

