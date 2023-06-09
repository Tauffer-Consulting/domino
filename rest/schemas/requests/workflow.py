from .base_model import BaseRequestModel
from typing import Dict, List, Optional
from enum import Enum
from pydantic import BaseModel, validator, Field
from datetime import datetime
from constants.default_pieces.storage import AWSS3DefaultPiece

"""
     Auxiliary data models
"""
class ScheduleIntervalType(str, Enum):
    none = "none"
    once =	"once"
    hourly = "hourly"
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    yearly = "yearly"


class UiSchema(BaseModel):
    nodes: Dict[
        str,
        Dict
    ]
    edges: List[Dict]


class WorkflowStorage(BaseModel):
    storage_source: Optional[str] # TODO use enum ?
    base_folder: Optional[str]

class WorkflowBaseSettings(BaseModel):
    # TODO remove regex ?
    name: str = Field(
        description="Workflow name", 
        example="workflow_name", 
        regex=r"^[\w]*$",
    )
    start_date: str
    end_date: Optional[str] # TODO add end date to UI?
    schedule_interval: ScheduleIntervalType
    catchup: Optional[bool] = False # TODO add catchup to UI?
    generate_report: Optional[bool] = False
    description: Optional[str] # TODO add description to UI?
    

    @validator('start_date')
    def start_date_validator(cls, v):
        try:
            converted_date =  datetime.fromisoformat(v).date()
            if converted_date < datetime.now().date():
                raise ValueError("Start date must be in the future")
            return converted_date.isoformat()

        except ValueError:
            raise ValueError(f"Invalid start date: {v}")

    @validator('end_date')
    def end_date_validator(cls, v, values):
        try:
            if 'start_date' not in values:
                raise ValueError("Start date must be provided")
            converted_start_date =  datetime.fromisoformat(values['start_date'])
            converted_end_date = datetime.fromisoformat(v)
            if converted_end_date <= converted_start_date:
                raise ValueError("End date must greater than start date")
            return converted_end_date.isoformat()
        except ValueError:
            raise ValueError(f"Invalid end date: {v}")


storage_default_piece_model_map = {
    'none': None,
    'aws_s3': AWSS3DefaultPiece
}

class WorkflowSharedStorageSourceEnum(str, Enum):
    none = "None"
    local = 'Local'
    aws_s3 = "AWS S3"

class WorkflowSharedStorageModeEnum(str, Enum):
    none = 'None'
    read = 'Read'
    read_write = 'Read/Write'
    

class WorkflowSharedStorageDataModel(BaseModel):
    source: Optional[WorkflowSharedStorageSourceEnum]
    base_folder: Optional[str]
    mode: Optional[WorkflowSharedStorageModeEnum]
    provider_options: Optional[Dict]

    class Config:
        use_enum_values = True

class TaskPieceDataModel(BaseModel):
    id: int
    name: str

class SystemRequirementsModel(BaseModel):
    cpu: float
    memory: float

class ContainerResourcesDataModel(BaseModel):
    requests: SystemRequirementsModel
    limits: SystemRequirementsModel
    use_gpu: bool


class TasksDataModel(BaseModel):
    workflow_shared_storage: WorkflowSharedStorageDataModel
    container_resources: ContainerResourcesDataModel
    task_id: str
    piece: TaskPieceDataModel
    piece_input_kwargs: Dict
    dependencies: Optional[List[str]]

"""
     Request data models
"""
class CreateWorkflowRequest(BaseModel):
    workflow: WorkflowBaseSettings
    tasks: Dict[
        str,
        TasksDataModel
    ]
    ui_schema: UiSchema

    @validator('tasks')
    def tasks_validator(cls, v):
        if not v:
            raise ValueError("Tasks must be provided")
        return v


class ListWorkflowsFilters(BaseModel):
    # TODO add filters
    created_at: Optional[str]
    name__like: Optional[str] = Field(alias="name")
    last_changed_at: Optional[str]
    start_date: Optional[str]
    start_date__gt: Optional[str]
    end_date: Optional[str]
    end_date__gt: Optional[str]
    schedule_interval: Optional[ScheduleIntervalType]

