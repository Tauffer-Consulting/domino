import { type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces";
import { type IGetWorkflowIdResponseInterface } from "features/myWorkflows/types/workflow";
import { dominoApiClient } from "services/clients/domino.client";
import useSWR from "swr";

interface IGetWorkflowIdParams {
  id?: string;
}

const getWorkflowUrl = (workspaceId: string, id?: string) =>
  id ? `/workspaces/${workspaceId}/workflows/${id}` : null;

/**
 * Get workflow by id using GET /workflow
 * @returns workflow
 */
const getWorkflowId: (
  workspaceId: string,
  params: IGetWorkflowIdParams,
) => Promise<
  AxiosResponse<IGetWorkflowIdResponseInterface> | undefined
> = async (workspaceId, params) => {
  const url = getWorkflowUrl(workspaceId, params.id);
  if (url) {
    return await dominoApiClient.get(url);
  }
};

/**
 * Get workflow by id
 * @param params `{ workspaceId: number, id: string }`
 * @returns workflow fetcher fn
 */
export const useAuthenticatedGetWorkflowId = ({ id }: IGetWorkflowIdParams) => {
  const { workspace } = useWorkspaces();

  if (!workspace)
    throw new Error(
      "Impossible to fetch workflows without specifying a workspace",
    );

  // todo add swr ?
  const fetcher = async (params: IGetWorkflowIdParams) => {
    return await getWorkflowId(workspace.id, params).then((data) => data?.data);
  };

  const key = getWorkflowUrl(workspace.id, id);

  return useSWR(key, async () => await fetcher({ id }), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
};
