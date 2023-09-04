import { type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces/workspaces.context";

import { dominoApiClient } from "../../clients/domino.client";

import { type IGetWorkflowRunTasksResponseInterface } from "./runs.interface";

export interface IGetWorkflowRunTasksParams {
  workflowId: string;
  runId: string;
  page: number;
  pageSize: number;
}

const getWorkflowRunTasksUrl = (
  workspace: string,
  workflowId: string,
  runId: string,
  page: number,
  pageSize: number,
) =>
  `/workspaces/${workspace}/workflows/${workflowId}/runs/${runId}/tasks?page=${page}&page_size=${pageSize}`;

/**
 * Get workflows using GET /workflows
 * @returns workflow
 */
const getWorkflowRunTasks: (
  workspace: string,
  workflowId: string,
  runId: string,
  page: number,
  pageSize: number,
) => Promise<AxiosResponse<IGetWorkflowRunTasksResponseInterface>> = async (
  workspace,
  workflowId,
  runId,
  page,
  pageSize,
) => {
  return await dominoApiClient.get(
    getWorkflowRunTasksUrl(workspace, workflowId, runId, page, pageSize),
  );
};

/**
 * Get workflow runs
 * @returns runs as swr response
 */
export const useAuthenticatedGetWorkflowRunTasks = () => {
  const { workspace } = useWorkspaces();
  if (!workspace)
    throw new Error(
      "Impossible to fetch workflows without specifying a workspace",
    );

  return async (params: IGetWorkflowRunTasksParams) =>
    await getWorkflowRunTasks(
      workspace.id,
      params.workflowId,
      params.runId,
      params.page,
      params.pageSize,
    ).then((data) => data.data);
};
