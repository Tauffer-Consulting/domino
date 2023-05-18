// TODO move to /runs
import { AxiosResponse } from 'axios'
import { dominoApiClient } from '../../clients/domino.client'


interface removeUserWorkspaceParams {
    workspaceId: string
    userId: string
}

const removeUserWorkspaceUrl = (workspaceId: string, userId: string) => `/workspaces/${workspaceId}/users/${userId}`

/**
 * Run workflow by id using /workflow/run/:id
 * @returns workflow run result
 */
const removeUserWorkspace: (
    params: removeUserWorkspaceParams
) => Promise<AxiosResponse> = (params) => {
    return dominoApiClient.delete(
        removeUserWorkspaceUrl(params.workspaceId, params.userId)
    )
}

/**
 * Run workflow by id fetcher fn
 * @param params `{ id: string }`
 */
export const useAuthenticatedRemoveUserWorkspace = () => {
    const fetcher = (params: removeUserWorkspaceParams) =>
        removeUserWorkspace(params).then(data => data)

    return fetcher
}



