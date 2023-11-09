import { type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces";
import { type IGetWorkflowResponseInterface } from "features/myWorkflows/types/workflow";
import { dominoApiClient } from "services/clients/domino.client";
import useSWR from "swr";

const getWorkflowsUrl = (workspace: string, page: number, pageSize: number) =>
  `/workspaces/${workspace}/workflows?page=${page}&page_size=${pageSize}`;

/**
 * Get workflows using GET /workflows
 * @param token auth token (string)
 * @returns workflow
 */
const getWorkflows: (
  workspace: string,
  page: number,
  pageSize: number,
) => Promise<AxiosResponse<IGetWorkflowResponseInterface>> = async (
  workspace,
  page,
  pageSize,
) => {
  return await dominoApiClient.get(getWorkflowsUrl(workspace, page, pageSize));
};

/**
 * Get workflow
 * @returns workflow as swr response
 */
export const useAuthenticatedGetWorkflows = (
  page: number = 0,
  pageSize: number = 5,
) => {
  const { workspace } = useWorkspaces();

  if (!workspace)
    throw new Error(
      "Impossible to fetch workflows without specifying a workspace",
    );

  const fetcher = async () =>
    await getWorkflows(workspace.id, page, pageSize).then((data) => data.data);

  return useSWR(
    getWorkflowsUrl(workspace.id, page, pageSize),
    async () => await fetcher(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};
