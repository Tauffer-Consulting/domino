// TODO move to /runs
import { type AxiosResponse } from "axios";
import { dominoApiClient } from "services/clients/domino.client";

interface RemoveUserWorkspaceParams {
  workspaceId: string;
  userId: string;
}

const removeUserWorkspaceUrl = (workspaceId: string, userId: string) =>
  `/workspaces/${workspaceId}/users/${userId}`;

/**
 * Run workflow by id using /workflow/run/:id
 * @returns workflow run result
 */
const removeUserWorkspace: (
  params: RemoveUserWorkspaceParams,
) => Promise<AxiosResponse> = async (params) => {
  return await dominoApiClient.delete(
    removeUserWorkspaceUrl(params.workspaceId, params.userId),
  );
};

/**
 * Run workflow by id fetcher fn
 * @param params `{ id: string }`
 */
export const useAuthenticatedRemoveUserWorkspace = () => {
  const fetcher = async (params: RemoveUserWorkspaceParams) =>
    await removeUserWorkspace(params).then((data) => data);

  return fetcher;
};
