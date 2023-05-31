import { AxiosResponse } from 'axios'
import { dominoApiClient } from '../../clients/domino.client'
import { useCallback } from 'react'

interface IPostWorkspacesResponseInterface {
  [x: string]: any
}

export interface IPostWorkspacesParams {
  name: string
}

/**
 * Create workspace using POST /workspaces
 * @returns ?
 */
const postWorkspaces: (
  params: IPostWorkspacesParams
) => Promise<AxiosResponse<IPostWorkspacesResponseInterface>> = (params) => {
  return dominoApiClient.post(`/workspaces`, params)
}

/**
 * Create authenticated workspaces
 * @param params `{ name: string }`
 * @returns crate workspaces function
 */
export const useAuthenticatedPostWorkspaces = () => {
  const fetcher = useCallback(
    (params: IPostWorkspacesParams) => postWorkspaces(params)
      .then(data => {
        return data.data
      }), [])

  return fetcher
}
