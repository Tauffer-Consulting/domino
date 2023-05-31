import { AxiosResponse } from 'axios'
import { dominoApiClient } from '../../clients/domino.client'
import { IDeleteWorkflowIdResponseInterface } from './workflow.interface'
import { useWorkspaces } from 'context/workspaces/workspaces.context'

interface IDeleteWorkflowIdParams {
  id: string
}

/**
 * Get workflow by id using GET /workflow
 * @returns workflow
 */
const deleteWorkflowId: (
  workspaceId: string,
  params: IDeleteWorkflowIdParams
) => Promise<AxiosResponse<IDeleteWorkflowIdResponseInterface>> = (workspaceId, params) => {
  return dominoApiClient.delete(`/workspaces/${workspaceId}/workflows/${params.id}`)
}

/**
 * Delete workflow by id
 * @returns authenticated delete function 
 */
export const useAuthenticatedDeleteWorkflowId = () => {
  const { workspace } = useWorkspaces()

  if (!workspace) throw new Error('Impossible to fetch delete without specifying a workspace')

  const fetcher = (params: IDeleteWorkflowIdParams) =>
    deleteWorkflowId(
      workspace.id as string,
      params
    ).then(data => data)
  return fetcher

}
