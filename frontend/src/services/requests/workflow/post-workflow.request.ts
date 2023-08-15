import { AxiosResponse } from 'axios'
import { dominoApiClient } from '../../clients/domino.client'
import { IPostWorkflowResponseInterface } from './workflow.interface'
import { CreateWorkflowRequest } from 'context/workflows/types'

export interface IPostWorkflowParams extends CreateWorkflowRequest {
  workspace_id: string
}

/**
 * Create workflow using POST /workflow
 * @returns ?
 */
const postWorkflow: (
  payload: IPostWorkflowParams
) => Promise<AxiosResponse<IPostWorkflowResponseInterface>> = (payload) => {

  return dominoApiClient.post(`/workspaces/${payload.workspace_id}/workflows`, payload)
}

/**
 * Create authenticated workflow
 * @param params `{ id: string, data: Record<string, unknown> }``
 * @returns crate workflow function
 */
export const useAuthenticatedPostWorkflow = () => {
  const fetcher = (params: IPostWorkflowParams) =>
    postWorkflow(
      params
    ).then(data => data.data)

  return fetcher
}
