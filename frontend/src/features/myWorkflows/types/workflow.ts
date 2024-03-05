import { type DefaultNode } from "features/workflowEditor/components/Panel/WorkflowPanel";

export type IWorkflowElement = DefaultNode;

enum workflowStatus {
  creating = "creating",
  failed = "failed",
  active = "active",
}

export interface IWorkflow {
  id: number;
  name: string;
  created_at: string;
  start_date: string;
  schema: IWorkflowSchema;
  ui_schema: IWorkDominoSchema;
  last_changed_at: string;
  last_changed_by: number; // todo will change to username probably
  created_by: number; // todo will change to username probably
  workspace_id: number;
  is_paused: boolean;
  is_active: boolean;
  status: workflowStatus;
  is_subdag: boolean;
  last_pickled: string;
  schedule: string;
  max_active_tasks: number;
  max_active_runs: number;
  has_task_concurrency_limits: boolean;
  has_import_errors: boolean;
  next_dagrun: string;
  next_dagrun_data_interval_start: string;
  next_dagrun_data_interval_end: string;
}

interface IPaginationMetadata {
  page: number;
  last_page: number;
  records: number;
  total: number;
}

export interface IWorkflowSchema {
  workflow_config: IWorkflowConfig;
  tasks: Record<string, unknown>;
}

export interface IWorkDominoSchema {
  nodes: Record<string, unknown>;
  edges: any[];
}

export interface IWorkflowConfig {
  name: string;
  start_date: string;
  end_date: string;
  schedule: string;
  catchup: boolean;
  generate_report: string;
  description: string;
}

/**
 * Get Workflow response interface
 */
export interface IGetWorkflowResponseInterface {
  data?: IWorkflow[];
  metadata?: IPaginationMetadata;
}

/**
 * Get Workflow by id response interface
 */
export type IGetWorkflowIdResponseInterface = IWorkflow;

/**
 * Post Workflow response interface
 */
export interface IPostWorkflowResponseInterface {
  id: number;
  name: string;
  created_at: string;
  schema: IWorkflowSchema;
}

/**
 * Delete Workflow by id response interface
 * @todo type properly
 */
export type IDeleteWorkflowIdResponseInterface = Record<string, any>;

/**
 * Post Workflow run by id response interface
 * @todo type properly
 */
export type IPostWorkflowRunIdResponseInterface = Record<string, any>;
