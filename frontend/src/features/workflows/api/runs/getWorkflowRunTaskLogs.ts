import { type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces";
import { dominoApiClient } from "services/clients/domino.client";
import useSWR from "swr";

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
) => {
  if (workspace && workflowId && runId && taskId && taskTryNumber) {
    return `/workspaces/${workspace}/workflows/${workflowId}/runs/${runId}/tasks/${taskId}/${taskTryNumber}/logs`;
  }
};

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
) => Promise<AxiosResponse<{ data: string[] }> | undefined> = async (
  workspace,
  workflowId,
  runId,
  taskId,
  taskTryNumber,
) => {
  const url = getWorkflowRunTaskLogsUrl(
    workspace,
    workflowId,
    runId,
    taskId,
    taskTryNumber,
  );
  if (url) return await dominoApiClient.get(url);
};

/**
 * Get workflow runs
 * @returns runs as swr response
 */
export const useAuthenticatedGetWorkflowRunTaskLogs = (
  params: IGetWorkflowRunTaskLogsParams,
) => {
  const { workspace } = useWorkspaces();
  if (!workspace)
    throw new Error(
      "Impossible to fetch workflows without specifying a workspace",
    );

  return useSWR(
    getWorkflowRunTaskLogsUrl(
      workspace.id,
      params.workflowId,
      params.runId,
      params.taskId,
      params.taskTryNumber,
    ) ?? null,
    async () =>
      await getWorkflowRunTaskLogs(
        workspace.id,
        params.workflowId,
        params.runId,
        params.taskId,
        params.taskTryNumber,
      ).then((data) => data?.data),
  );
};
