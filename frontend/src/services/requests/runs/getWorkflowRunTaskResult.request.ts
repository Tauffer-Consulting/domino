import { type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces";

import { dominoApiClient } from "../../clients/domino.client";

import { type IGetWorkflowRunTasksResponseInterface } from "./runs.interface";

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
) =>
  `/workspaces/${workspace}/workflows/${workflowId}/runs/${runId}/tasks/${taskId}/${taskTryNumber}/result`;

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
) => Promise<AxiosResponse<IGetWorkflowRunTasksResponseInterface>> = async (
  workspace,
  workflowId,
  runId,
  taskId,
  taskTryNumber,
) => {
  return await dominoApiClient.get(
    getWorkflowRunTaskResultUrl(
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
export const useAuthenticatedGetWorkflowRunTaskResult = () => {
  const { workspace } = useWorkspaces();
  if (!workspace)
    throw new Error(
      "Impossible to fetch workflows without specifying a workspace",
    );

  return async (params: IGetWorkflowRunTaskResultParams) =>
    await getWorkflowRunTaskResult(
      workspace.id,
      params.workflowId,
      params.runId,
      params.taskId,
      params.taskTryNumber,
    ).then((data) => data.data);
};
