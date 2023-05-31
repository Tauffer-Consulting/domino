// TODO move to /runs
import { AxiosResponse } from 'axios'
import { dominoApiClient } from '../../clients/domino.client'


interface acceptWorkspaceInviteParams {
    workspaceId: string
}

const acceptWorkspaceInviteUrl = (workspaceId: string) => `/workspaces/${workspaceId}/invites/accept`

/**
 * Run workflow by id using /workflow/run/:id
 * @returns workflow run result
 */
const acceptWorkspaceInvite: (
    params: acceptWorkspaceInviteParams
) => Promise<AxiosResponse> = (params) => {
    return dominoApiClient.post(
        acceptWorkspaceInviteUrl(params.workspaceId), null
    )
}

/**
 * Run workflow by id fetcher fn
 * @param params `{ id: string }`
 */
export const useAuthenticatedAcceptWorkspaceInvite = () => {

    const fetcher = (params: acceptWorkspaceInviteParams) =>
        acceptWorkspaceInvite(params).then(data => data)

    return fetcher
}



