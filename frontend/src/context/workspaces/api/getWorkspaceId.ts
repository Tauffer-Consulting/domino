import { type AxiosResponse } from "axios";
import { dominoApiClient } from "services/clients/domino.client";
import useSWR from "swr";

import { type IGetWorkspaceIdResponseInterface } from "../types/workspaces";

interface IGetWorkspaceIdParams {
  id: string;
}

/**
 * Get workspaces using GET /workspaces/<id>
 * @param id workspace id
 * @returns workspace
 */
const getWorkspaceId: (
  params: IGetWorkspaceIdParams,
) => Promise<AxiosResponse<IGetWorkspaceIdResponseInterface>> = async (
  params,
) => {
  return await dominoApiClient.get(`/workspaces/${params.id}`);
};

/**
 * Authenticated fetcher function that gets workspace by id
 * @param params `{ id: string }`
 * @returns workspace fetcher fn
 */
export const useAuthenticatedGetWorkspaceIdFetcher = () => {
  return async (params: IGetWorkspaceIdParams) =>
    await getWorkspaceId(params).then((data) => data.data);
};

/**
 * Get workspace data
 * @returns workspace data as swr response
 */
export const useAuthenticatedGetWorkspace = (params: IGetWorkspaceIdParams) => {
  const fetcher = useAuthenticatedGetWorkspaceIdFetcher();
  return useSWR(`/workspaces/${params.id}`, async () => await fetcher(params), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
};
