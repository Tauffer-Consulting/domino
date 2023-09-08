import { type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces";
import { type IDeleteWorkflowIdResponseInterface } from "features/workflows/types/workflow";
import { dominoApiClient } from "services/clients/domino.client";

interface IDeleteWorkflowIdParams {
  id: string;
}

/**
 * Get workflow by id using GET /workflow
 * @returns workflow
 */
const deleteWorkflowId: (
  workspaceId: string,
  params: IDeleteWorkflowIdParams,
) => Promise<AxiosResponse<IDeleteWorkflowIdResponseInterface>> = async (
  workspaceId,
  params,
) => {
  return await dominoApiClient.delete(
    `/workspaces/${workspaceId}/workflows/${params.id}`,
  );
};

/**
 * Delete workflow by id
 * @returns authenticated delete function
 */
export const useAuthenticatedDeleteWorkflowId = () => {
  const { workspace } = useWorkspaces();

  if (!workspace)
    throw new Error(
      "Impossible to fetch delete without specifying a workspace",
    );

  const fetcher = async (params: IDeleteWorkflowIdParams) =>
    await deleteWorkflowId(workspace.id, params).then((data) => data);
  return fetcher;
};
