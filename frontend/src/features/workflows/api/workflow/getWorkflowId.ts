import { type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces";
import { type IGetWorkflowIdResponseInterface } from "features/workflows/types/workflow";
import { dominoApiClient } from "services/clients/domino.client";

interface IGetWorkflowIdParams {
  id: string;
}

const getWorkflowUrl = (workspaceId: string, id: string) =>
  `/workspaces/${workspaceId}/workflows/${id}`;

/**
 * Get workflow by id using GET /workflow
 * @returns workflow
 */
const getWorkflowId: (
  workspaceId: string,
  params: IGetWorkflowIdParams,
) => Promise<AxiosResponse<IGetWorkflowIdResponseInterface>> = async (
  workspaceId,
  params,
) => {
  return await dominoApiClient.get(getWorkflowUrl(workspaceId, params.id));
};

/**
 * Get workflow by id
 * @param params `{ workspaceId: number, id: string }`
 * @returns workflow fetcher fn
 */
export const useAuthenticatedGetWorkflowId = () => {
  const { workspace } = useWorkspaces();

  if (!workspace)
    throw new Error(
      "Impossible to fetch workflows without specifying a workspace",
    );

  // todo add swr ?
  const fetcher = async (params: IGetWorkflowIdParams) => {
    return await getWorkflowId(workspace.id, params).then((data) => data.data);
  };

  return fetcher;
};
