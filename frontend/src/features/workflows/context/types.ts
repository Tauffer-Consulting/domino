import { type Edge, type Node } from "reactflow";

import { type IWorkflow, type IWorkflowRunTasks } from "../types";

export interface IWorkflowProvider {
  workflow: IWorkflow;
  setWorkflow: (id: string) => void;
  deleteWorkflow: (id: string) => void;

  workflowRuns: Record<
    string,
    { tasks: IWorkflowRunTasks; nodes: Node[]; edges: Edge[] }
  >;

  triggerWorkflowRun: (id: string) => void;
  pauseWorkflowRun: (id: string) => void;
  cancelWorkflowRun: (id: string) => void;
}
