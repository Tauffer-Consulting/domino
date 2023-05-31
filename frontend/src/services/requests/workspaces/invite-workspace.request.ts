// TODO move to /runs
import { AxiosResponse } from 'axios'
import { dominoApiClient } from '../../clients/domino.client'


interface inviteWorkspaceParams {
    workspaceId: string
    userEmail: string
    permission: string
}

const inviteWorkspaceUrl = (workspaceId: string) => `/workspaces/${workspaceId}/invites`

/**
 * Run workflow by id using /workflow/run/:id
 * @returns workflow run result
 */
const inviteWorkspace: (
    params: inviteWorkspaceParams
) => Promise<AxiosResponse> = (params) => {
    return dominoApiClient.post(
        inviteWorkspaceUrl(params.workspaceId), {
            user_email: params.userEmail,
            permission: params.permission
        }
    )
}

/**
 * Run workflow by id fetcher fn
 * @param params `{ id: string }`
 */
export const useAuthenticatedWorkspaceInvite = () => {

    const fetcher = (params: inviteWorkspaceParams) =>
        inviteWorkspace(params).then(data => data)

    return fetcher
}



