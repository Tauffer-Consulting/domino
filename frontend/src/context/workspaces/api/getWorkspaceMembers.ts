import { type AxiosResponse } from "axios";
import { useAuthentication } from "context/authentication";
import { useCallback } from "react";
import { dominoApiClient } from "services/clients/domino.client";
import useSWR from "swr";

import { type IGetWorkspaceUsersResponse } from "../types/workspaces";

interface IGetWorkspaceMembers {
  workspaceId: string;
  page: number;
  pageSize: number;
}

const getWorkspaceUsersUrl = (
  auth: boolean,
  workspaceId: string,
  page: number,
  pageSize: number,
) => {
  return auth && workspaceId
    ? `/workspaces/${workspaceId}/users?page=${page}&page_size=${pageSize}`
    : null;
};

/**
 * Get workspaces using GET /workspaces
 * @returns workspaces
 */
const getWorkspaceUsers: (
  auth: boolean,
  workspaceId: string,
  page: number,
  pageSize: number,
) => Promise<AxiosResponse<IGetWorkspaceUsersResponse> | undefined> = async (
  auth,
  workspaceId,
  page,
  pageSize,
) => {
  if (auth && workspaceId && page && pageSize) {
    const url = getWorkspaceUsersUrl(auth, workspaceId, page, pageSize);

    if (url) return await dominoApiClient.get(url);
  }
};

/**
 * Get workspaces
 * @returns workspaces as swr response
 */
export const useAuthenticatedGetWorkspaceUsers = (
  params: IGetWorkspaceMembers,
) => {
  if (!params.page) {
    params.page = 0;
  }
  if (!params.pageSize) {
    params.pageSize = 10;
  }

  const auth = useAuthentication();

  const fetcher = useCallback(async () => {
    return await getWorkspaceUsers(
      auth.isLogged,
      params.workspaceId,
      params.page,
      params.pageSize,
    ).then((data) => data?.data);
  }, [params, auth]);

  return useSWR(
    getWorkspaceUsersUrl(
      auth.isLogged,
      params.workspaceId,
      params.page,
      params.pageSize,
    ),
    fetcher,
  );
};
