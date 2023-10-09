interface IPaginationMetadata {
  page: number;
  last_page: number;
  records: number;
  total: number;
}

enum runState {
  success = "success",
  failed = "failed",
  running = "running",
  queued = "queued",
}

export enum taskState {
  success = "success",
  running = "running",
  failed = "failed",
  upstream_failed = "upstream_failed",
  skipped = "skipped",
  up_for_retry = "up_for_retry",
  up_for_reschedule = "up_for_reschedule",
  queued = "queued",
  none = "none",
  scheduled = "scheduled",
  deferred = "deferred",
  removed = "removed",
  restarting = "restarting",
}

export interface IWorkflowRuns {
  workflow_uuid: string;
  workflow_run_id: string;
  start_date: string;
  end_date: string;
  execution_date: string;
  state: runState;
}

export interface IWorkflowRunTasks {
  workflow_uuid: string;
  workflow_run_id: string;
  duration: number | null;
  start_date: string | null;
  end_date: string | null;
  execution_date: string;
  docker_image: string | null;
  task_id: string;
  try_number: number;
  state: taskState;
}

export interface IGetWorkflowRunsResponseInterface {
  data?: IWorkflowRuns[];
  metadata?: IPaginationMetadata;
}

export interface IGetWorkflowRunTasksResponseInterface {
  data?: IWorkflowRunTasks[];
  metadata?: IPaginationMetadata;
}
