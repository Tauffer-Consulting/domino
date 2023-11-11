from pydantic import BaseModel, Field
from enum import Enum


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
        description='Name of the output argument.',
        json_schema_extra={
            "from_upstream": "never"
        }
    )
    type: OutputModifierItemType = Field(
        default=OutputModifierItemType.string,
        description='Type of the output argument.',
        json_schema_extra={
            "from_upstream": "never"
        },
    )
    description: str = Field(
        default="",
        description='Description of the output argument.',
        json_schema_extra={
            "from_upstream": "never"
        }
    )
