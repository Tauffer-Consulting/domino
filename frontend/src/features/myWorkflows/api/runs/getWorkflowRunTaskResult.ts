import { type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces";
import { dominoApiClient } from "services/clients/domino.client";
import useSWR from "swr";

export interface IGetWorkflowRunTaskResultParams {
  workflowId: string;
  runId: string;
  taskId: string;
  taskTryNumber: string;
}

const getWorkflowRunTaskResultUrl = (
  workspace: string,
  workflowId: string,
  runId: string,
  taskId: string,
  taskTryNumber: string,
) => {
  if (workspace && workflowId && runId && taskId && Number(taskTryNumber))
    return `/workspaces/${workspace}/workflows/${workflowId}/runs/${runId}/tasks/${taskId}/${taskTryNumber}/result`;
};

/**
 * Get workflows using GET /workflows
 * @returns workflow
 */
const getWorkflowRunTaskResult: (
  workspace: string,
  workflowId: string,
  runId: string,
  taskId: string,
  taskTryNumber: string,
) => Promise<
  AxiosResponse<{ base64_content: string; file_type: string }> | undefined
> = async (workspace, workflowId, runId, taskId, taskTryNumber) => {
  if (workspace && workflowId && runId && taskId && taskTryNumber) {
    const url = getWorkflowRunTaskResultUrl(
      workspace,
      workflowId,
      runId,
      taskId,
      taskTryNumber,
    );
    if (url) return await dominoApiClient.get(url);
  }
};

/**
 * Get workflow runs
 * @returns runs as swr response
 */
export const useAuthenticatedGetWorkflowRunTaskResult = (
  params: IGetWorkflowRunTaskResultParams,
) => {
  const { workspace } = useWorkspaces();
  if (!workspace)
    throw new Error(
      "Impossible to fetch workflows without specifying a workspace",
    );

  return useSWR(
    getWorkflowRunTaskResultUrl(
      workspace.id,
      params.workflowId,
      params.runId,
      params.taskId,
      params.taskTryNumber,
    ) ?? null,
    async () =>
      await getWorkflowRunTaskResult(
        workspace.id,
        params.workflowId,
        params.runId,
        params.taskId,
        params.taskTryNumber,
      ).then((data) => data?.data),
  );
};
