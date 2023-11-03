from typing import Dict, List, Optional
from enum import Enum
from pydantic import BaseModel, field_validator, Field, ConfigDict
from pydantic_core.core_schema import FieldValidationInfo
from datetime import datetime
from constants.default_pieces.storage import AWSS3StoragePiece


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


class SelectEndDate(str, Enum):
    never = "never"
    user_defined = "User defined"

class WorkflowBaseSettings(BaseModel):
    # TODO remove regex ?
    name: str = Field(
        description="Workflow name", 
        example="workflow_name", 
        pattern=r"^[\w]*$",
    )
    start_date: str = Field(alias="startDateTime")
    select_end_date: Optional[SelectEndDate] = Field(alias="selectEndDate", default=SelectEndDate.never)
    end_date: Optional[str] = Field(alias='endDateTime', default=None)
    schedule: ScheduleIntervalType = Field(alias="scheduleInterval")
    catchup: Optional[bool] = False # TODO add catchup to UI?
    generate_report: Optional[bool] = Field(alias="generateReport", default=False) # TODO add generate report to UI?
    description: Optional[str] = None # TODO add description to UI?
    

    @field_validator('start_date')
    def start_date_validator(cls, v):
        try:
            if '.' in v:
                v = v.split('.')[0]
            if 'T' in v:
                converted_date =  datetime.strptime(v, "%Y-%m-%dT%H:%M:%S").date()
            else:
                converted_date =  datetime.strptime(v, "%Y-%m-%d").date()
            if converted_date < datetime.now().date():
                raise ValueError("Start date must be in the future")
            return converted_date.isoformat()

        except ValueError:
            raise ValueError(f"Invalid start date: {v}")

    @field_validator('end_date')
    def end_date_validator(cls, v, info: FieldValidationInfo):
        try:
            if 'start_date' not in info.data:
                raise ValueError("Start date must be provided")
            converted_start_date =  datetime.fromisoformat(info.data['start_date'])
            if 'select_end_date' not in info.data:
                raise ValueError("Select end date must be provided")
            
            if info.data['select_end_date'] == SelectEndDate.never.value:
                return None

            converted_end_date = datetime.strptime(v, "%Y-%m-%dT%H:%M:%S.%fZ").date()
            if converted_end_date <= converted_start_date:
                raise ValueError("End date must greater than start date")
            return converted_end_date.isoformat()
        except ValueError:
            raise ValueError(f"Invalid end date: {v}")
    
    
    model_config = ConfigDict(populate_by_name=True)


storage_default_piece_model_map = {
    'none': None,
    'aws_s3': AWSS3StoragePiece
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
    source: Optional[WorkflowSharedStorageSourceEnum] = None
    mode: Optional[WorkflowSharedStorageModeEnum] = None
    provider_options: Optional[Dict] = None

    
    model_config = ConfigDict(use_enum_values=True)

class TaskPieceDataModel(BaseModel):
    name: str
    source_image: str

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
    dependencies: Optional[List[str]] = None

"""
Request data models
"""
class CreateWorkflowRequest(BaseModel):
    workflow: WorkflowBaseSettings
    tasks: Dict[
        str, # str === TasksDataModel['task_id']
        TasksDataModel
    ]
    ui_schema: UiSchema

    @field_validator('tasks')
    def tasks_validator(cls, v):
        if not v:
            raise ValueError("Tasks must be provided")
        return v


class ListWorkflowsFilters(BaseModel):
    # TODO add filters
    created_at: Optional[str] = None
    name__like: Optional[str] = Field(alias="name", default=None)
    last_changed_at: Optional[str] = None
    start_date: Optional[str] = None
    start_date__gt: Optional[str] = None
    end_date: Optional[str] = None
    end_date__gt: Optional[str] = None
    schedule: Optional[ScheduleIntervalType] = None

