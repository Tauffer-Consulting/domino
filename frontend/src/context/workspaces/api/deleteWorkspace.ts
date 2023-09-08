import { type AxiosResponse } from "axios";
import { useCallback } from "react";
import { dominoApiClient } from "services/clients/domino.client";

type IDeleteWorkspacesResponseInterface = unknown;

export interface IDeleteWorkspacesParams {
  id: string;
}

/**
 * Delete workspace using delete /workspaces/:id
 * @returns ?
 */
const deleteWorkspace: (
  params: IDeleteWorkspacesParams,
) => Promise<AxiosResponse<IDeleteWorkspacesResponseInterface>> = async (
  params,
) => {
  return await dominoApiClient.delete(`/workspaces/${params.id}`);
};

export const useAuthenticatedDeleteWorkspaces = () => {
  const fetcher = useCallback(
    async (params: IDeleteWorkspacesParams) =>
      await deleteWorkspace(params).then((data) => {
        return data;
      }),
    [],
  );

  return fetcher;
};
