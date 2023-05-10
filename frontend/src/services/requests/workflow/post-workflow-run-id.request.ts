// TODO move to /runs
import { AxiosResponse } from 'axios'
import { useWorkspaces } from 'context/workspaces/workspaces.context'
import { dominoApiClient } from '../../clients/domino.client'
import { IPostWorkflowRunIdResponseInterface } from './workflow.interface'

interface IPostWorkflowRunIdParams {
  id: string
}

const postWorkflowRunUrl = (workspaceId: string, id: string) => `/workspaces/${workspaceId}/workflows/${id}/runs`

/**
 * Run workflow by id using /workflow/run/:id
 * @returns workflow run result
 */
const postWorkflowRunId: (
  workspaceId: string,
  params: IPostWorkflowRunIdParams
) => Promise<AxiosResponse<IPostWorkflowRunIdResponseInterface>> = (workspaceId, params) => {

  return dominoApiClient.post(postWorkflowRunUrl(workspaceId, params.id), null)
}

/**
 * Run workflow by id fetcher fn
 * @param params `{ id: string }`
 */
export const useAuthenticatedPostWorkflowRunId = () => {
  const { workspace } = useWorkspaces()

  if (!workspace) throw new Error('Impossible to run workflows without specifying a workspace')

  const fetcher = (params: IPostWorkflowRunIdParams) =>
    postWorkflowRunId(
      workspace.id as string,
      params
    ).then(data => data)

  return fetcher
}



