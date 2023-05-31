import { AxiosResponse } from 'axios'
import useSWR from 'swr'
import { useWorkspaces } from 'context/workspaces/workspaces.context'
import { dominoApiClient } from '../../clients/domino.client'
import { IGetOperatorsRepositoriesResponseInterface } from './operator.interface'

interface IGetOperatorRepositoryFilters {
  page?: number
  page_size?: number
  name__like?: string
  path__like?: string
  version?: string
  source?: "github" | "default"
}

const getOperatorsRepositoriesUrl = (workspace: string, filters: IGetOperatorRepositoryFilters) => {
  const query = new URLSearchParams()
  query.set('workspace_id', workspace)
  for (const [key, value] of Object.entries(filters)) {
    query.set(key, value)
  }
  return `/pieces-repositories?${query.toString()}`
}

/**
 * Get operator using GET /pieces-repositories
 * @returns operator
 */
const getOperatorsRepositories: (
  workspace: string,
  filters: IGetOperatorRepositoryFilters
) => Promise<AxiosResponse<IGetOperatorsRepositoriesResponseInterface>> = (
  workspace,
  filters
) => {
    // 
    return dominoApiClient.get(getOperatorsRepositoriesUrl(workspace, filters))
  }


/**
 * Get pieces repositories for current workspace
 * @returns pieces repositories as swr response
 */
export const useAuthenticatedGetOperatorRepositories = (filters: IGetOperatorRepositoryFilters) => {
  const { workspace } = useWorkspaces()

  if (!workspace)
    throw new Error(
      'Impossible to fetch pieces repositories without specifying a workspace'
    )

  const fetcher = (filters: IGetOperatorRepositoryFilters) => getOperatorsRepositories(workspace.id, filters).then((data) => data.data)

  return useSWR(getOperatorsRepositoriesUrl(workspace.id, filters), () => fetcher(filters), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
}
