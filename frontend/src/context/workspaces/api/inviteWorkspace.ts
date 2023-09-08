// TODO move to /runs
import { type AxiosResponse } from "axios";
import { dominoApiClient } from "services/clients/domino.client";

interface inviteWorkspaceParams {
  workspaceId: string;
  userEmail: string;
  permission: string;
}

const inviteWorkspaceUrl = (workspaceId: string) =>
  `/workspaces/${workspaceId}/invites`;

/**
 * Run workflow by id using /workflow/run/:id
 * @returns workflow run result
 */
const inviteWorkspace: (
  params: inviteWorkspaceParams,
) => Promise<AxiosResponse> = async (params) => {
  return await dominoApiClient.post(inviteWorkspaceUrl(params.workspaceId), {
    user_email: params.userEmail,
    permission: params.permission,
  });
};

/**
 * Run workflow by id fetcher fn
 * @param params `{ id: string }`
 */
export const useAuthenticatedWorkspaceInvite = () => {
  const fetcher = async (params: inviteWorkspaceParams) =>
    await inviteWorkspace(params).then((data) => data);

  return fetcher;
};
