// TODO move to /runs
import { AxiosResponse } from 'axios'
import { useWorkspaces } from 'context/workspaces/workspaces.context'


import { dominoApiClient } from '../../clients/domino.client'


interface PatchRepositorySecretParams {
    repositoryId: string
    secretId: string,
    payload: {
        value: string | null
    }
}

const patchRepositorySecretUrl = (repositoryId: string, secretId: string) => `/pieces-repositories/${repositoryId}/secrets/${secretId}`

/**
 * Run workflow by id using /workflow/run/:id
 * @returns workflow run result
 */
const patchRepositorySecret: (
    params: PatchRepositorySecretParams
) => Promise<AxiosResponse> = (params) => {

    return dominoApiClient.patch(patchRepositorySecretUrl(params.repositoryId, params.secretId), params.payload)
}

/**
 * Run workflow by id fetcher fn
 * @param params `{ id: string }`
 */
export const useAuthenticatedPatchRepositorySecret = () => {
    const { workspace } = useWorkspaces()

    if (!workspace) throw new Error('Impossible to run workflows without specifying a workspace')

    const fetcher = (params: PatchRepositorySecretParams) =>
        patchRepositorySecret(
            params
        ).then(data => data)

    return fetcher
}



