import { type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces/workspaces.context";

import { dominoApiClient } from "../../clients/domino.client";

import { type IDeleteWorkflowIdResponseInterface } from "./workflow.interface";

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
