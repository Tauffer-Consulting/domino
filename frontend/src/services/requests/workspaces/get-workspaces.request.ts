import { useCallback } from 'react'
import { AxiosResponse } from 'axios'
import useSWR from 'swr'
import { dominoApiClient } from 'services/clients/domino.client'
import { IGetWorkspacesResponseInterface } from './workspaces.interface'
import { useAuthentication } from 'context/authentication'

/**
 * Get workspaces using GET /workspaces
 * @returns workspaces
 */
const getWorkspaces: (
) => Promise<AxiosResponse<IGetWorkspacesResponseInterface>> = () => {
  return dominoApiClient.get('/workspaces',)
}

/**
 * Get workspaces
 * @returns workspaces as swr response
 */
export const useAuthenticatedGetWorkspaces = () => {

  const fetcher = useCallback(async () => {
    return getWorkspaces().then(data => data.data)
  }, [])

  const auth = useAuthentication()

  return useSWR(auth.isLogged ? `/workspaces` : null, () => fetcher(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
}
