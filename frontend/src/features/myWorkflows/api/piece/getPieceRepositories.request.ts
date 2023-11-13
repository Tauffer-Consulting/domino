import { type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces";
import { dominoApiClient } from "services/clients/domino.client";
import useSWR from "swr";

import { type IGetPiecesRepositoriesResponseInterface } from "./piece.interface";

interface IGetPieceRepositoryFilters {
  page?: number;
  page_size?: number;
  name__like?: string;
  path__like?: string;
  version?: string;
  source?: "github" | "default";
}

const getPiecesRepositoriesUrl = (
  filters: IGetPieceRepositoryFilters,
  workspace?: string,
) => {
  if (!workspace) {
    return null;
  }
  const query = new URLSearchParams();
  query.set("workspace_id", workspace);
  for (const [key, value] of Object.entries(filters)) {
    query.set(key, value);
  }
  return `/pieces-repositories?${query.toString()}`;
};

/**
 * Get Piece using GET /pieces-repositories
 * @returns Piece
 */
const getPiecesRepositories: (
  filters: IGetPieceRepositoryFilters,
  workspace?: string,
) => Promise<
  AxiosResponse<IGetPiecesRepositoriesResponseInterface> | undefined
> = async (filters, workspace) => {
  //
  if (workspace) {
    return await dominoApiClient.get(
      getPiecesRepositoriesUrl(filters, workspace) as string,
    );
  }
};

/**
 * Get pieces repositories for current workspace
 * @returns pieces repositories as swr response
 */
export const useAuthenticatedGetPieceRepositories = (
  filters: IGetPieceRepositoryFilters,
) => {
  const { workspace } = useWorkspaces();

  const fetcher = async (filters: IGetPieceRepositoryFilters) =>
    await getPiecesRepositories(filters, workspace?.id).then(
      (data) => data?.data,
    );

  return useSWR(
    getPiecesRepositoriesUrl(filters, workspace?.id),
    async () => await fetcher(filters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};
