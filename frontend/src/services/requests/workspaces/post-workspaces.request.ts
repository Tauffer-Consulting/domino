import { type AxiosResponse } from "axios";
import { useCallback } from "react";

import { dominoApiClient } from "../../clients/domino.client";

type IPostWorkspacesResponseInterface = Record<string, any>;

export interface IPostWorkspacesParams {
  name: string;
}

/**
 * Create workspace using POST /workspaces
 * @returns ?
 */
const postWorkspaces: (
  params: IPostWorkspacesParams,
) => Promise<AxiosResponse<IPostWorkspacesResponseInterface>> = async (
  params,
) => {
  return await dominoApiClient.post(`/workspaces`, params);
};

/**
 * Create authenticated workspaces
 * @param params `{ name: string }`
 * @returns crate workspaces function
 */
export const useAuthenticatedPostWorkspaces = () => {
  const fetcher = useCallback(
    async (params: IPostWorkspacesParams) =>
      await postWorkspaces(params).then((data) => {
        return data.data;
      }),
    [],
  );

  return fetcher;
};
