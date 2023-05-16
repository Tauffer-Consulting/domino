from schemas.responses.base import PaginationSet
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Dict, Optional, List, Union
from enum import Enum

class WorkflowStatus(str, Enum):
    creating = "creating"

# TODO mapp more states ?
class WorkflowRunState(str, Enum):
    running = "running"
    queued = "queued"
    success = "success"
    failed = "failed"

class WorkflowRunTaskState(str, Enum):
    success = "success"
    running = "running"
    failed = "failed"
    upstream_failed = "upstream_failed"
    skipped = "skipped"
    up_for_retry = "up_for_retry"
    up_for_reschedule = "up_for_reschedule"
    queued = "queued"
    none = "none"
    scheduled = "scheduled"
    deferred = "deferred"
    removed = "removed"
    restarting = "restarting"


class ScheduleIntervalTypeResponse(str, Enum):
    none = "none"
    once = "@once"
    hourly = "@hourly"
    daily = "@daily"
    weekly = "@weekly"
    monthly = "@monthly"
    yearly = "@yearly"


class WorkflowConfigResponse(BaseModel):
    # TODO remove regex ?
    name: str
    start_date: str
    end_date: Optional[str]
    schedule_interval: Optional[ScheduleIntervalTypeResponse]
    catchup: bool = False
    generate_report: bool = False
    description: Optional[str]


    @validator('schedule_interval')
    def set_schedule_interval(cls, schedule_interval):
        return schedule_interval or ScheduleIntervalTypeResponse.none
    
class BaseWorkflowModel(BaseModel):
    workflow: WorkflowConfigResponse
    tasks: Dict[
        str,  #TaskItemId
        dict
    ]


class GetWorkflowsResponseData(BaseModel):
    id: int
    name: str
    created_at: datetime
    last_changed_at: datetime
    last_changed_by: int
    created_by: int
    workspace_id: int
    is_paused: Union[bool, WorkflowStatus]
    is_active: Union[bool, WorkflowStatus]
    schedule_interval: Optional[Union[ScheduleIntervalTypeResponse, WorkflowStatus]]

    @validator('schedule_interval')
    def set_schedule_interval(cls, schedule_interval):
        return schedule_interval or ScheduleIntervalTypeResponse.none

class GetWorkflowsResponse(BaseModel):
    data: List[GetWorkflowsResponseData]
    metadata: PaginationSet

class BaseUiSchema(BaseModel):
    nodes: Dict[str, Dict]
    edges: List[Dict]

class GetWorkflowResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    schema_: Optional[BaseWorkflowModel] = Field(alias="schema")
    ui_schema: Optional[BaseUiSchema]
    last_changed_at: datetime
    last_changed_by: int
    created_by: int
    workspace_id: int

    # Airflow database infos # TODO check if add more fields, or if we should use /details fields to get more infos
    is_paused: Optional[Union[bool, WorkflowStatus]] # Whether the DAG is paused.
    is_active: Optional[Union[bool, WorkflowStatus]] # Whether the DAG is currently seen by the scheduler(s).
    is_subdag: Optional[Union[bool, WorkflowStatus]] # Whether the DAG is SubDAG.
    last_pickled: Optional[Union[datetime, WorkflowStatus]] # The last time the DAG was pickled.
    last_expired: Optional[Union[datetime, WorkflowStatus]] # Time when the DAG last received a refresh signal (e.g. the DAG's "refresh" button was clicked in the web UI)
    schedule_interval: Optional[Union[ScheduleIntervalTypeResponse, WorkflowStatus]] # The schedule interval for the DAG.
    max_active_tasks: Optional[Union[int, WorkflowStatus]]  # Maximum number of active tasks that can be run on the DAG
    max_active_runs: Optional[Union[int, WorkflowStatus]] # Maximum number of active DAG runs for the DAG
    has_task_concurrency_limits: Optional[Union[bool, WorkflowStatus]] # Whether the DAG has task concurrency limits
    has_import_errors: Optional[Union[bool, WorkflowStatus]] # Whether the DAG has import errors
    next_dagrun: Optional[Union[datetime, WorkflowStatus]] # The logical date of the next dag run.
    next_dagrun_data_interval_start: Optional[Union[datetime, WorkflowStatus]] # The start date of the next dag run.
    next_dagrun_data_interval_end: Optional[Union[datetime, WorkflowStatus]] # The end date of the next dag run.

    @validator('schedule_interval')
    def set_schedule_interval(cls, schedule_interval):
        return schedule_interval or ScheduleIntervalTypeResponse.none


class GetWorkflowRunsResponseData(BaseModel):
    dag_id: str = Field(alias='workflow_uuid')
    dag_run_id: str = Field(alias='workflow_run_id')
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    execution_date: Optional[datetime]
    state: Optional[WorkflowRunState]

    @validator('state')
    def set_state(cls, state):
        return state or WorkflowRunState.none
    

    class Config:
        allow_population_by_field_name = True


class GetWorkflowRunsResponse(BaseModel):
    data: List[GetWorkflowRunsResponseData]
    metadata: PaginationSet


class GetWorkflowRunTasksResponseData(BaseModel):
    dag_id: str = Field(alias='workflow_uuid')
    dag_run_id: str = Field(alias='workflow_run_id')
    duration: Optional[float]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    execution_date: Optional[datetime]
    docker_image: Optional[str]
    task_id: str
    try_number: int
    state: Optional[WorkflowRunTaskState]

    @validator('state')
    def set_state(cls, state):
        return state or WorkflowRunTaskState.none

    class Config:
        allow_population_by_field_name = True


class GetWorkflowRunTasksResponse(BaseModel):
    data: List[GetWorkflowRunTasksResponseData]
    metadata: PaginationSet


class WorkflowSchemaBaseModel(BaseModel):
    workflow: Dict
    tasks: Dict


class GetWorkflowRunTaskResultResponse(BaseModel):
    base64_content: str
    file_type: str


class GetWorkflowRunTaskLogsResponse(BaseModel):
    data: List[str]


class CreateWorkflowResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    schema_: WorkflowSchemaBaseModel = Field(..., alias='schema')
    created_by: int
    last_changed_at: datetime
    last_changed_by: int


class DeleteWorkflowResponse(BaseModel):
    workflow_id: int