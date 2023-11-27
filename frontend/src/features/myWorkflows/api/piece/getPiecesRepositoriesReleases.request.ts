import { type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces";
import { dominoApiClient } from "services/clients/domino.client";

import {
  type IGetPiecesRepositoriesReleasesParams,
  type IGetPiecesRepositoriesReleasesResponseInterface,
} from "./piece.interface";

/**
 * Get Piece repository releases using GET /pieces-repositories/releases
 * @param token auth token (string)
 * @returns Piece repository
 */
const getPiecesRepositoriesReleases: (
  params: IGetPiecesRepositoriesReleasesParams,
) => Promise<
  AxiosResponse<IGetPiecesRepositoriesReleasesResponseInterface> | undefined
> = async ({ source, path, workspaceId }) => {
  if (!workspaceId) {
    return;
  }
  const search = new URLSearchParams();
  search.set("source", source);
  search.set("path", path);
  search.set("workspace_id", workspaceId);

  return await dominoApiClient.get(
    `/pieces-repositories/releases?${search.toString()}`,
  );
};

/**
 * Get releases for a given Piece repository
 * @returns pieces repositories releases
 */
export const useAuthenticatedGetPieceRepositoriesReleases = () => {
  const { workspace } = useWorkspaces();

  return async (params: IGetPiecesRepositoriesReleasesParams) =>
    await getPiecesRepositoriesReleases({
      ...params,
      workspaceId: workspace?.id,
    }).then((data) => {
      return data?.data;
    });
};
