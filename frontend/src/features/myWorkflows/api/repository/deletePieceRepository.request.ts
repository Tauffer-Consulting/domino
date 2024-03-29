// TODO move to /runs
import { type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces";
import { dominoApiClient } from "services/clients/domino.client";

const deleteRepositoryUrl = (id: string) => `/pieces-repositories/${id}`;

/**
 * Run workflow by id using /workflow/run/:id
 * @returns workflow run result
 */
const deleteRepository: (id: string) => Promise<AxiosResponse> = async (id) => {
  return await dominoApiClient.delete(deleteRepositoryUrl(id));
};

/**
 * Run workflow by id fetcher fn
 * @param params `{ id: string }`
 */
export const useAuthenticatedDeleteRepository = () => {
  const { workspace } = useWorkspaces();

  if (!workspace) return async (_id: string) => {};

  const fetcher = async (id: string) =>
    await deleteRepository(id).then((data) => data);

  return fetcher;
};
