// TODO move to /runs
import { type AxiosResponse } from "axios";

import { dominoApiClient } from "../../clients/domino.client";

interface rejectWorkspaceInviteParams {
  workspaceId: string;
}

const rejectWorkspaceInviteUrl = (workspaceId: string) =>
  `/workspaces/${workspaceId}/invites/reject`;

/**
 * Run workflow by id using /workflow/run/:id
 * @returns workflow run result
 */
const rejectWorkspaceInvite: (
  params: rejectWorkspaceInviteParams,
) => Promise<AxiosResponse> = async (params) => {
  return await dominoApiClient.post(
    rejectWorkspaceInviteUrl(params.workspaceId),
    null,
  );
};

/**
 * Run workflow by id fetcher fn
 * @param params `{ id: string }`
 */
export const useAuthenticatedRejectWorkspaceInvite = () => {
  const fetcher = async (params: rejectWorkspaceInviteParams) =>
    await rejectWorkspaceInvite(params).then((data) => data);

  return fetcher;
};
