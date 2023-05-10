import { AxiosResponse } from 'axios'
import useSWR from 'swr'
import { useWorkspaces } from 'context/workspaces/workspaces.context'
import { dominoApiClient } from '../../clients/domino.client'
import { IGetWorkflowResponseInterface } from './workflow.interface'

const getWorkflowsUrl = (workspace: string, page: number, pageSize: number) => `/workspaces/${workspace}/workflows?page=${page}&page_size=${pageSize}`

/**
 * Get workflows using GET /workflows
 * @param token auth token (string)
 * @returns workflow
 */
const getWorkflows: (
  workspace: string,
  page: number,
  pageSize: number
) => Promise<AxiosResponse<IGetWorkflowResponseInterface>> = (workspace, page, pageSize) => {

  return dominoApiClient.get(getWorkflowsUrl(workspace, page, pageSize))
}

/**
 * Get workflow
 * @returns workflow as swr response
 */
export const useAuthenticatedGetWorkflows = (page: number = 0, pageSize: number = 5) => {
  const { workspace } = useWorkspaces()

  if (!workspace) throw new Error('Impossible to fetch workflows without specifying a workspace')

  const fetcher = () => getWorkflows(workspace.id, page, pageSize).then(data => data.data)

  return useSWR(
    getWorkflowsUrl(workspace.id, page, pageSize),
    () => fetcher(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )
}
