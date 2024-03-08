from schemas.responses.base import PaginationSet
from pydantic import BaseModel, Field, field_validator, ConfigDict
from datetime import datetime, timezone
from typing import Dict, Optional, List, Union
from enum import Enum

class WorkflowStatus(str, Enum):
    creating = "creating"
    failed = "failed"
    active = "active"


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
    end_date: Optional[str] = None
    schedule: Optional[ScheduleIntervalTypeResponse] = None
    catchup: bool = False
    generate_report: bool = False
    description: Optional[str] = None


    @field_validator('schedule')
    def set_schedule(cls, schedule):
        return schedule or ScheduleIntervalTypeResponse.none

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
    start_date: datetime
    last_changed_at: datetime
    last_changed_by: int
    created_by: int
    workspace_id: int
    is_paused: bool
    is_active: bool
    status: WorkflowStatus
    schedule: Optional[ScheduleIntervalTypeResponse] = None
    next_dagrun: Optional[datetime] = None

    @field_validator('schedule')
    def set_schedule(cls, schedule):
        return schedule or ScheduleIntervalTypeResponse.none

    @field_validator('start_date', mode='before')
    def add_utc_timezone_start_date(cls, v):
        if isinstance(v, datetime) and v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        return v

    @field_validator('created_at', mode='before')
    def add_utc_timezone_created_at(cls, v):
        if isinstance(v, datetime) and v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        return v

    @field_validator('last_changed_at', mode='before')
    def add_utc_timezone_last_changed_at(cls, v):
        if isinstance(v, datetime) and v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        return v

    @field_validator('next_dagrun', mode='before')
    def add_utc_timezone_next_dagrun(cls, v):
        if isinstance(v, datetime) and v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        return v

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
    schema_: dict = Field(alias="schema", default=None) # TODO add data model
    ui_schema: Optional[BaseUiSchema] = None
    last_changed_at: datetime
    last_changed_by: int
    created_by: int
    workspace_id: int

    # Airflow database infos # TODO check if add more fields, or if we should use /details fields to get more infos
    is_paused: Optional[Union[bool, WorkflowStatus]] = None # Whether the DAG is paused.
    is_active: Optional[Union[bool, WorkflowStatus]] = None # Whether the DAG is currently seen by the scheduler(s).
    is_subdag: Optional[Union[bool, WorkflowStatus]] = None # Whether the DAG is SubDAG.
    last_pickled: Optional[Union[datetime, WorkflowStatus]] = None # The last time the DAG was pickled.
    last_expired: Optional[Union[datetime, WorkflowStatus]] = None # Time when the DAG last received a refresh signal (e.g. the DAG's "refresh" button was clicked in the web UI)
    schedule: Optional[Union[ScheduleIntervalTypeResponse, WorkflowStatus]] = None # The schedule interval for the DAG.
    max_active_tasks: Optional[Union[int, WorkflowStatus]] = None  # Maximum number of active tasks that can be run on the DAG
    max_active_runs: Optional[Union[int, WorkflowStatus]] = None # Maximum number of active DAG runs for the DAG
    has_task_concurrency_limits: Optional[Union[bool, WorkflowStatus]] = None # Whether the DAG has task concurrency limits
    has_import_errors: Optional[Union[bool, WorkflowStatus]] = None # Whether the DAG has import errors
    next_dagrun: Optional[Union[datetime, WorkflowStatus]] = None # The logical date of the next dag run.
    next_dagrun_data_interval_start: Optional[Union[datetime, WorkflowStatus]] = None # The start date of the next dag run.
    next_dagrun_data_interval_end: Optional[Union[datetime, WorkflowStatus]] = None # The end date of the next dag run.

    @field_validator('schedule')
    def set_schedule(cls, schedule):
        return schedule or ScheduleIntervalTypeResponse.none


class GetWorkflowRunsResponseData(BaseModel):
    dag_id: str = Field(alias='workflow_uuid')
    dag_run_id: str = Field(alias='workflow_run_id')
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    execution_date: Optional[datetime] = None
    state: Optional[WorkflowRunState] = None

    @field_validator('state')
    def set_state(cls, state):
        return state or WorkflowRunState.none


    model_config = ConfigDict(populate_by_name=True)


class GetWorkflowRunsResponse(BaseModel):
    data: List[GetWorkflowRunsResponseData]
    metadata: PaginationSet


class GetWorkflowRunTasksResponseData(BaseModel):
    dag_id: str = Field(alias='workflow_uuid')
    dag_run_id: str = Field(alias='workflow_run_id')
    duration: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    execution_date: Optional[datetime] = None
    docker_image: Optional[str] = None
    task_id: str
    try_number: int
    state: Optional[WorkflowRunTaskState] = None

    @field_validator('state')
    def set_state(cls, state):
        return state or WorkflowRunTaskState.none


    model_config = ConfigDict(populate_by_name=True)


class GetWorkflowRunTasksResponse(BaseModel):
    data: List[GetWorkflowRunTasksResponseData]
    metadata: PaginationSet


class WorkflowSchemaBaseModel(BaseModel):
    workflow: Dict
    tasks: Dict


class GetWorkflowRunTaskResultResponse(BaseModel):
    base64_content: Optional[str] = None
    file_type: Optional[str] = None

class GetWorkflowResultReport(BaseModel):
    base64_content: Optional[str] = None
    file_type: Optional[str] = None
    piece_name: Optional[str] = None
    dag_id: str
    duration: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    execution_date: Optional[datetime] = None
    task_id: str
    state: Optional[WorkflowRunTaskState] = None

class GetWorkflowResultReportResponse(BaseModel):
    data: List[GetWorkflowResultReport]

class GetWorkflowRunTaskLogsResponse(BaseModel):
    data: List[str]


class CreateWorkflowResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    schema_: dict = Field(..., alias='schema') # TODO add data modal
    created_by: int
    last_changed_at: datetime
    last_changed_by: int


class DeleteWorkflowResponse(BaseModel):
    workflow_id: int