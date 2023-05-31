from pydantic import BaseModel, Field


class FromUpstream(BaseModel):
    upstream_task_id: str = Field(
        description="Upstream task id", 
    )
    output_arg: str = Field(
        description="Output argument from upstream task", 
    )