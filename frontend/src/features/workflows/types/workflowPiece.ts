export interface IWorkflowPieceElement {
  id: string;
  type?: string;
  data: {
    name: string;
    handleOrientation: "horizontal" | "vertical";
    style: any;
  };
  position: { x: number; y: number };
}

export interface IWorkflowPiece {
  id: number;
  name: string;
  created_at: string;
  schema: IWorkflowPieceSchema;
  ui_schema: IWorkflowPieceDominoSchema;
  last_changed_at: string;
  last_changed_by: number; // todo will change to username probably
  created_by: number; // todo will change to username probably
  workspace_id: number;
  is_paused: boolean;
  is_active: boolean;
  is_subdag: boolean;
  last_pickled: string;
  schedule_interval: string;
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

export interface IWorkflowPieceSchema {
  workflow_config: IWorkflowPieceConfig;
  tasks: Record<string, unknown>;
}

export interface IWorkflowPieceDominoSchema {
  nodes: Record<string, unknown>;
  edges: any[];
}

export interface IWorkflowPieceConfig {
  name: string;
  start_date: string;
  end_date: string;
  schedule_interval: string;
  catchup: boolean;
  generate_report: string;
  description: string;
}

/**
 * Get Workflow response interface
 */
export interface IGetWorkflowPieceResponseInterface {
  data?: IWorkflowPiece[];
  metadata?: IPaginationMetadata;
}

/**
 * Get Workflow by id response interface
 */
export type IGetWorkflowPieceIdResponseInterface = IWorkflowPiece;

/**
 * Post Workflow response interface
 */
export interface IPostWorkflowPieceResponseInterface {
  id: number;
  name: string;
  created_at: string;
  schema: IWorkflowPieceSchema;
}

/**
 * Delete Workflow by id response interface
 * @todo type properly
 */
export type IDeleteWorkflowPieceIdResponseInterface = Record<string, any>;
