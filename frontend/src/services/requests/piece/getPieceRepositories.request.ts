import { type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces";
import useSWR from "swr";

import { dominoApiClient } from "../../clients/domino.client";

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
  workspace: string,
  filters: IGetPieceRepositoryFilters,
) => {
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
  workspace: string,
  filters: IGetPieceRepositoryFilters,
) => Promise<AxiosResponse<IGetPiecesRepositoriesResponseInterface>> = async (
  workspace,
  filters,
) => {
  //
  return await dominoApiClient.get(
    getPiecesRepositoriesUrl(workspace, filters),
  );
};

/**
 * Get pieces repositories for current workspace
 * @returns pieces repositories as swr response
 */
export const useAuthenticatedGetPieceRepositories = (
  filters: IGetPieceRepositoryFilters,
) => {
  const { workspace } = useWorkspaces();

  if (!workspace)
    throw new Error(
      "Impossible to fetch pieces repositories without specifying a workspace",
    );

  const fetcher = async (filters: IGetPieceRepositoryFilters) =>
    await getPiecesRepositories(workspace.id, filters).then(
      (data) => data.data,
    );

  return useSWR(
    getPiecesRepositoriesUrl(workspace.id, filters),
    async () => await fetcher(filters),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};
