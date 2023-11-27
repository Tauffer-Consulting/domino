// TODO move to /runs
import { type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces";
import { dominoApiClient } from "services/clients/domino.client";

interface PatchWorkspaceParams {
  workspaceId: string;
  payload: {
    name?: string | null;
    github_access_token?: string | null;
  };
}

const patchWorkspaceUrl = (workspaceId: string) => `/workspaces/${workspaceId}`;

/**
 * Run workflow by id using /workflow/run/:id
 * @returns workflow run result
 */
const patchWorkspace: (
  params: PatchWorkspaceParams,
) => Promise<AxiosResponse> = async (params) => {
  return await dominoApiClient.patch(
    patchWorkspaceUrl(params.workspaceId),
    params.payload,
  );
};

/**
 * Run workflow by id fetcher fn
 * @param params `{ id: string }`
 */
export const useAuthenticatedPatchWorkspace = () => {
  const { workspace } = useWorkspaces();

  if (!workspace) return async (_params: PatchWorkspaceParams) => {};

  const fetcher = async (params: PatchWorkspaceParams) =>
    await patchWorkspace(params).then((data) => data);

  return fetcher;
};
