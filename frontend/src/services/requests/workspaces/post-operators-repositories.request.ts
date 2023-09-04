import { type AxiosResponse } from "axios";
import { dominoApiClient } from "services/clients/domino.client";

import {
  type IPostWorkspaceRepositoryParams,
  type IPostWorkspaceRepositoryPayload,
  type IPostWorkspaceRepositoryResponseInterface,
} from "./workspaces.interface";

/**
 * Create workspacesidoperatorsrepositories using POST /workspacesidoperatorsrepositories
 * @returns ?
 */
const postOperatorsRepository: (
  params: IPostWorkspaceRepositoryParams,
) => Promise<AxiosResponse<IPostWorkspaceRepositoryResponseInterface>> = async (
  params,
) => {
  return await dominoApiClient.post("/pieces-repositories", params.data);
};

/**
 * Create authenticated workspacesidoperatorsrepositories
 * @param params `{ id: string, data: Record<string, unknown> }``
 * @returns crate workspacesidoperatorsrepositories function
 */
export const useAuthenticatedPostOperatorsRepository = (params: {
  workspace: string;
}) => {
  if (!params?.workspace)
    throw new Error("Impossible to add repositories without a workspace!");

  const fetcher = async (payload: IPostWorkspaceRepositoryPayload) =>
    await postOperatorsRepository({
      id: params.workspace,
      data: payload,
    }).then((data) => data.data);

  return fetcher;
};
