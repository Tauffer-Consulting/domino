// TODO move to /runs
import { AxiosResponse } from 'axios'
import { useWorkspaces } from 'context/workspaces/workspaces.context'


import { dominoApiClient } from '../../clients/domino.client'


interface getWorkspaceMembersParams {
    workspaceId: string
}

const getWorkspaceMembersUrl = (workspaceId: string) => `/workspaces/${workspaceId}/users`

/**
 * Run workflow by id using /workflow/run/:id
 * @returns workflow run result
 */
const getWorkspaceMembers: (
    params: getWorkspaceMembersParams
) => Promise<AxiosResponse> = (params) => {
    return dominoApiClient.get(
        getWorkspaceMembersUrl(params.workspaceId)
    )
}

/**
 * Run workflow by id fetcher fn
 * @param params `{ id: string }`
 */
export const useAuthenticatedGetWorkspaceUsers = () => {
    const { workspace } = useWorkspaces()

    if (!workspace) throw new Error('Impossible to run workflows without specifying a workspace')

    const fetcher = (params: getWorkspaceMembersParams) => getWorkspaceMembers(params).then(data => data)

    return fetcher
}



