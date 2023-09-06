import { type AxiosResponse } from "axios";
import { dominoApiClient } from "services/clients/domino.client";

import {
  type IPostWorkspaceRepositoryParams,
  type IPostWorkspaceRepositoryPayload,
  type IPostWorkspaceRepositoryResponseInterface,
} from "./workspaces.interface";

/**
 * Create workspacesidPiecesrepositories using POST /workspacesidPiecesrepositories
 * @returns ?
 */
const postPiecesRepository: (
  params: IPostWorkspaceRepositoryParams,
) => Promise<AxiosResponse<IPostWorkspaceRepositoryResponseInterface>> = async (
  params,
) => {
  return await dominoApiClient.post("/pieces-repositories", params.data);
};

/**
 * Create authenticated workspacesidPiecesrepositories
 * @param params `{ id: string, data: Record<string, unknown> }``
 * @returns crate workspacesidPiecesrepositories function
 */
export const useAuthenticatedPostPiecesRepository = (params: {
  workspace: string;
}) => {
  if (!params?.workspace)
    throw new Error("Impossible to add repositories without a workspace!");

  const fetcher = async (payload: IPostWorkspaceRepositoryPayload) =>
    await postPiecesRepository({
      id: params.workspace,
      data: payload,
    }).then((data) => data.data);

  return fetcher;
};
