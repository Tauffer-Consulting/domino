import { type AxiosResponse } from "axios";
import { useAuthentication } from "context/authentication";
import { useCallback } from "react";
import { dominoApiClient } from "services/clients/domino.client";
import useSWR from "swr";

import { type IGetWorkspaceUsersResponse } from "./workspaces.interface";

interface IGetWorkspaceMembers {
  workspaceId: string;
  page: number;
  pageSize: number;
}

/**
 * Get workspaces using GET /workspaces
 * @returns workspaces
 */
const getWorkspaceUsers: (
  workspaceId: string,
  page: number,
  pageSize: number,
) => Promise<AxiosResponse<IGetWorkspaceUsersResponse>> = async (
  workspaceId,
  page,
  pageSize,
) => {
  return await dominoApiClient.get(
    `/workspaces/${workspaceId}/users?page=${page}&page_size=${pageSize}`,
  );
};

/**
 * Get workspaces
 * @returns workspaces as swr response
 */
export const useAuthenticatedGetWorkspaceUsers = (
  params: IGetWorkspaceMembers,
) => {
  const fetcher = useCallback(async (params: IGetWorkspaceMembers) => {
    return await getWorkspaceUsers(
      params.workspaceId,
      params.page,
      params.pageSize,
    ).then((data) => data.data);
  }, []);

  const auth = useAuthentication();

  if (!params.page) {
    params.page = 0;
  }
  if (!params.pageSize) {
    params.pageSize = 10;
  }
  return useSWR(
    auth.isLogged && params.workspaceId
      ? `/workspaces/${params.workspaceId}/users?page=${params.page}&page_size=${params.pageSize}`
      : null,
    async () => await fetcher(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};
