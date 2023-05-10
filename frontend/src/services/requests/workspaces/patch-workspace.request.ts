// TODO move to /runs
import { AxiosResponse } from 'axios'
import { useWorkspaces } from 'context/workspaces/workspaces.context'


import { dominoApiClient } from '../../clients/domino.client'


interface patchWorkspaceParams {
    workspaceId: string
    payload: {
        name?: string | null
        github_access_token?: string | null
    }
}

const patchWorkspaceUrl = (workspaceId: string) => `/workspaces/${workspaceId}`

/**
 * Run workflow by id using /workflow/run/:id
 * @returns workflow run result
 */
const patchWorkspace: (
    params: patchWorkspaceParams
) => Promise<AxiosResponse> = (params) => {
    console.log('url', patchWorkspaceUrl(params.workspaceId))
    return dominoApiClient.patch(
        patchWorkspaceUrl(params.workspaceId), params.payload
    )
}

/**
 * Run workflow by id fetcher fn
 * @param params `{ id: string }`
 */
export const useAuthenticatedPatchWorkspace = () => {
    const { workspace } = useWorkspaces()

    if (!workspace) throw new Error('Impossible to run workflows without specifying a workspace')

    const fetcher = (params: patchWorkspaceParams) =>
        patchWorkspace(params).then(data => data)

    return fetcher
}



