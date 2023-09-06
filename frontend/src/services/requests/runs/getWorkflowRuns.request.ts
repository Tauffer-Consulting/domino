import { type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces";
import useSWR from "swr";

import { dominoApiClient } from "../../clients/domino.client";

import { type IGetWorkflowRunsResponseInterface } from "./runs.interface";

interface IGetWorkflowRunParams {
  workflowId: string;
  page: number;
  pageSize: number;
}

const getWorkflowRunsUrl = (
  workspace: string,
  workflowId: string,
  page: number,
  pageSize: number,
) =>
  `/workspaces/${workspace}/workflows/${workflowId}/runs?page=${page}&page_size=${pageSize}`;

/**
 * Get workflows using GET /workflows
 * @returns workflow
 */
const getWorkflowRuns: (
  workspace: string,
  workflowId: string,
  page: number,
  pageSize: number,
) => Promise<AxiosResponse<IGetWorkflowRunsResponseInterface>> = async (
  workspace,
  workflowId,
  page,
  pageSize,
) => {
  return await dominoApiClient.get(
    getWorkflowRunsUrl(workspace, workflowId, page, pageSize),
  );
};

export const useAuthenticatedGetWorkflowRunFetcher = () => {
  const { workspace } = useWorkspaces();
  if (!workspace)
    throw new Error(
      "Impossible to fetch workflows without specifying a workspace",
    );

  return async (params: IGetWorkflowRunParams) =>
    await getWorkflowRuns(
      workspace.id,
      params.workflowId,
      params.page,
      params.pageSize,
    ).then((data) => data.data);
};

/**
 * Get workflow runs
 * @returns runs as swr response
 */
export const useAuthenticatedGetWorkflowRuns = (
  params: IGetWorkflowRunParams,
) => {
  const { workspace } = useWorkspaces();
  if (!workspace)
    throw new Error(
      "Impossible to fetch workflows without specifying a workspace",
    );

  const fetcher = useAuthenticatedGetWorkflowRunFetcher();

  return useSWR(
    params.workflowId
      ? getWorkflowRunsUrl(
          workspace.id,
          params.workflowId,
          params.page,
          params.pageSize,
        )
      : null,
    async () => await fetcher(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};
