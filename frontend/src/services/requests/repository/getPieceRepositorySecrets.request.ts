import { type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces";
import useSWR from "swr";

import { dominoApiClient } from "../../clients/domino.client";

import { type IPieceRepositorySecretsData } from "./pieceRepository.interface";

interface IGetRepositorySecretsParams {
  repositoryId: string;
}

const getRepositorySecretsUrl = (repositoryId: string) =>
  `/pieces-repositories/${repositoryId}/secrets`;

/**
 * Get workflows using GET /workflows
 * @returns workflow
 */
const getRepositorySecrets: (
  repositoryId: string,
) => Promise<AxiosResponse<IPieceRepositorySecretsData[]>> = async (
  repositoryId,
) => {
  return await dominoApiClient.get(getRepositorySecretsUrl(repositoryId));
};

export const useAuthenticatedGetWorkflowRunTasksFetcher = () => {
  const { workspace } = useWorkspaces();

  if (!workspace)
    throw new Error(
      "Impossible to fetch workflows without specifying a workspace",
    );

  return async (params: IGetRepositorySecretsParams) =>
    await getRepositorySecrets(params.repositoryId).then((data) => data.data);
};

/**
 * Get workflow runs
 * @returns runs as swr response
 */
export const useAuthenticatedGetRepositorySecrets = (
  params: IGetRepositorySecretsParams,
) => {
  const { workspace } = useWorkspaces();
  if (!workspace)
    throw new Error(
      "Impossible to fetch workflows without specifying a workspace",
    );

  const fetcher = useAuthenticatedGetWorkflowRunTasksFetcher();

  return useSWR(
    params.repositoryId ? getRepositorySecretsUrl(params.repositoryId) : null,
    async () => await fetcher(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};
