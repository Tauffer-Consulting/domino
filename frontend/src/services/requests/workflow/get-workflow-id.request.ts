import { AxiosResponse } from 'axios'
import { useWorkspaces } from 'context/workspaces/workspaces.context'
import { dominoApiClient } from '../../clients/domino.client'
import { IGetWorkflowIdResponseInterface } from './workflow.interface'

interface IGetWorkflowIdParams {
  id: string
}

const getWorkflowUrl = (workspaceId: string, id: string) => `/workspaces/${workspaceId}/workflows/${id}`

/**
 * Get workflow by id using GET /workflow
 * @returns workflow
 */
const getWorkflowId: (
  workspaceId: string,
  params: IGetWorkflowIdParams
) => Promise<AxiosResponse<IGetWorkflowIdResponseInterface>> = (workspaceId, params) => {

  return dominoApiClient.get(getWorkflowUrl(workspaceId, params.id))
}


/**
 * Get workflow by id
 * @param params `{ workspaceId: number, id: string }`
 * @returns workflow fetcher fn
 */
export const useAuthenticatedGetWorkflowId = () => {
  const { workspace } = useWorkspaces()

  if (!workspace) throw new Error('Impossible to fetch workflows without specifying a workspace')

  // todo add swr ?
  const fetcher = (params: IGetWorkflowIdParams) => {
    return getWorkflowId(
      workspace.id as string,
      params
    ).then(data => data.data)
  }

  return fetcher

}
