export interface IWorkflowElement {
  id: string
  type: string
  data: {
    name: string
    handleOrientation: "horizontal" | "vertical"
    style: any
  }
  position: { x: number, y: number }
}

enum WorkflowStatus {
  creating = "creating",
  failed = "failed",
  active = "active",
}

export interface IWorkflow {
  id: number
  name: string
  created_at: string
  schema: IWorkflowSchema
  ui_schema: IWorkDominoSchema
  last_changed_at: string
  last_changed_by: number // todo will change to username probably
  created_by: number // todo will change to username probably
  workspace_id: number
  is_paused: boolean
  is_active: boolean
  status: WorkflowStatus
  is_subdag: boolean
  last_pickled: string
  schedule_interval: string
  max_active_tasks: number
  max_active_runs: number
  has_task_concurrency_limits: boolean
  has_import_errors: boolean
  next_dagrun: string
  next_dagrun_data_interval_start: string
  next_dagrun_data_interval_end: string
}

interface IPaginationMetadata {
  page: number
  last_page: number
  records: number
  total: number
}


export interface IWorkflowSchema {
  workflow_config: IWorkflowConfig
  tasks: Record<string, unknown>
}

export interface IWorkDominoSchema {
  nodes: Record<string, unknown>
  edges: any[]
}

export interface IWorkflowConfig {
  name: string
  start_date: string
  end_date: string
  schedule_interval: string
  catchup: boolean
  generate_report: string
  description: string
}

/**
 * Get Workflow response interface
 */
export type IGetWorkflowResponseInterface = {
  data?: IWorkflow[]
  metadata?: IPaginationMetadata
}

/**
 * Get Workflow by id response interface
 */
export type IGetWorkflowIdResponseInterface = IWorkflow

/**
 * Post Workflow response interface
 */
export interface IPostWorkflowResponseInterface {
  id: number
  name: string
  created_at: string
  schema: IWorkflowSchema
}

/**
 * Delete Workflow by id response interface
 * @todo type properly
 */
export interface IDeleteWorkflowIdResponseInterface {
  [x: string]: any
}

/**
 * Post Workflow run by id response interface
 * @todo type properly
 */
export interface IPostWorkflowRunIdResponseInterface {
  [x: string]: any
}
