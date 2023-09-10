import { type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces";
import { type IGetWorkflowRunTasksResponseInterface } from "features/workflows/types/runs";
import { dominoApiClient } from "services/clients/domino.client";

export interface IGetWorkflowRunTaskLogsParams {
  workflowId: string;
  runId: string;
  taskId: string;
  taskTryNumber: string;
}

const getWorkflowRunTaskLogsUrl = (
  workspace: string,
  workflowId: string,
  runId: string,
  taskId: string,
  taskTryNumber: string,
) =>
  `/workspaces/${workspace}/workflows/${workflowId}/runs/${runId}/tasks/${taskId}/${taskTryNumber}/logs`;

/**
 * Get workflows using GET /workflows
 * @returns workflow
 */
const getWorkflowRunTaskLogs: (
  workspace: string,
  workflowId: string,
  runId: string,
  taskId: string,
  taskTryNumber: string,
) => Promise<AxiosResponse<IGetWorkflowRunTasksResponseInterface>> = async (
  workspace,
  workflowId,
  runId,
  taskId,
  taskTryNumber,
) => {
  return await dominoApiClient.get(
    getWorkflowRunTaskLogsUrl(
      workspace,
      workflowId,
      runId,
      taskId,
      taskTryNumber,
    ),
  );
};

/**
 * Get workflow runs
 * @returns runs as swr response
 */
export const useAuthenticatedGetWorkflowRunTaskLogs = () => {
  const { workspace } = useWorkspaces();
  if (!workspace)
    throw new Error(
      "Impossible to fetch workflows without specifying a workspace",
    );

  return async (params: IGetWorkflowRunTaskLogsParams) =>
    await getWorkflowRunTaskLogs(
      workspace.id,
      params.workflowId,
      params.runId,
      params.taskId,
      params.taskTryNumber,
    ).then((data) => data.data);
};