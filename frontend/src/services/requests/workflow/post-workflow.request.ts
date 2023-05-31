import { AxiosResponse } from 'axios'
import { dominoApiClient } from '../../clients/domino.client'
import { IPostWorkflowResponseInterface, IWorkflowSchema } from './workflow.interface'

export interface IPostWorkflowParams {
  workspace_id: string
  data: IWorkflowSchema
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
