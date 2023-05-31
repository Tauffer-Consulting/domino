import { AxiosResponse } from 'axios'
import { useWorkspaces } from 'context/workspaces/workspaces.context'
import { dominoApiClient } from '../../clients/domino.client'
import {
  IGetOperatorsRepositoriesReleasesParams,
  IGetOperatorsRepositoriesReleasesResponseInterface
} from './operator.interface'

/**
 * Get operator repository releases using GET /pieces-repositories/releases
 * @param token auth token (string)
 * @returns operator repository
 */
const getOperatorsRepositoriesReleases: (
  params: IGetOperatorsRepositoriesReleasesParams
) => Promise<
  AxiosResponse<IGetOperatorsRepositoriesReleasesResponseInterface>
> = ({ source, path, workspaceId }) => {
  const search = new URLSearchParams()
  search.set('source', source)
  search.set('path', path)
  if (workspaceId){
    search.set('workspace_id', workspaceId)
  }

  return dominoApiClient.get(`/pieces-repositories/releases?${search.toString()}`)
}

/**
 * Get releases for a given operator repository
 * @returns pieces repositories releases
 */
export const useAuthenticatedGetOperatorRepositoriesReleases = () => {
  const { workspace } = useWorkspaces()

  if (!workspace)
    throw new Error(
      'Impossible to fetch pieces repositories without specifying a workspace'
    )

  return (params: IGetOperatorsRepositoriesReleasesParams) => 
    getOperatorsRepositoriesReleases({...params, workspaceId: workspace.id}).then((data) => { return data.data })
}
