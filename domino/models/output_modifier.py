from pydantic import BaseModel, Field
from enum import Enum
from typing import List


class OutputModifierItemType(str, Enum):
    """
    OutputArgsType Enum
    """
    string = 'string'
    integer = 'integer'
    float = 'float'
    boolean = 'boolean'
    array = 'array'


class OutputModifierModel(BaseModel):
    name: str = Field(
        default=None,
        description='Name of the output argument.',
        from_upstream="never"
    )
    description: str = Field(
        default=None,
        description='Description of the output argument.',
        from_upstream="never"
    )
    type: OutputModifierItemType = Field(
        default=OutputModifierItemType.string,
        description='Type of the output argument.',
        from_upstream="never"
    )