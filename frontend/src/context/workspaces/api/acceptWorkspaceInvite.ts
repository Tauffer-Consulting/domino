// TODO move to /runs
import { type AxiosResponse } from "axios";
import { dominoApiClient } from "services/clients/domino.client";

interface AcceptWorkspaceInviteParams {
  workspaceId: string;
}

const acceptWorkspaceInviteUrl = (workspaceId: string) =>
  `/workspaces/${workspaceId}/invites/accept`;

/**
 * Run workflow by id using /workflow/run/:id
 * @returns workflow run result
 */
const acceptWorkspaceInvite: (
  params: AcceptWorkspaceInviteParams,
) => Promise<AxiosResponse> = async (params) => {
  return await dominoApiClient.post(
    acceptWorkspaceInviteUrl(params.workspaceId),
    null,
  );
};

/**
 * Run workflow by id fetcher fn
 * @param params `{ id: string }`
 */
export const useAuthenticatedAcceptWorkspaceInvite = () => {
  const fetcher = async (params: AcceptWorkspaceInviteParams) =>
    await acceptWorkspaceInvite(params).then((data) => data);

  return fetcher;
};
