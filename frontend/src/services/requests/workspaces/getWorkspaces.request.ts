import { type AxiosResponse } from "axios";
import { useAuthentication } from "context/authentication";
import { useCallback } from "react";
import { dominoApiClient } from "services/clients/domino.client";
import useSWR from "swr";

import { type IGetWorkspacesResponseInterface } from "./workspaces.interface";

/**
 * Get workspaces using GET /workspaces
 * @returns workspaces
 */
const getWorkspaces: () => Promise<
  AxiosResponse<IGetWorkspacesResponseInterface>
> = async () => {
  return await dominoApiClient.get("/workspaces");
};

/**
 * Get workspaces
 * @returns workspaces as swr response
 */
export const useAuthenticatedGetWorkspaces = () => {
  const fetcher = useCallback(async () => {
    return await getWorkspaces().then((data) => data.data);
  }, []);

  const auth = useAuthentication();

  return useSWR(
    auth.isLogged ? `/workspaces` : null,
    async () => await fetcher(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};
