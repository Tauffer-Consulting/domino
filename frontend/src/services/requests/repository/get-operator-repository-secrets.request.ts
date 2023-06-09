import { AxiosResponse } from 'axios'
import useSWR from 'swr'
import { useWorkspaces } from 'context/workspaces/workspaces.context'


import { dominoApiClient } from '../../clients/domino.client'
import { IOperatorRepositorySecretsData } from './operator-repository.interface'


interface IGetRepositorySecretsParams {
    repositoryId: string
}


const getRepositorySecretsUrl = (
    repositoryId: string
) => `/pieces-repositories/${repositoryId}/secrets`

/**
 * Get workflows using GET /workflows
 * @returns workflow
 */
const getRepositorySecrets: (
    repositoryId: string,
) => Promise<AxiosResponse<IOperatorRepositorySecretsData[]>> = (repositoryId) => {

    return dominoApiClient.get(getRepositorySecretsUrl(repositoryId))
}

export const useAuthenticatedGetWorkflowRunTasksFetcher = () => {
    const { workspace } = useWorkspaces()

    if (!workspace) throw new Error('Impossible to fetch workflows without specifying a workspace')

    return (params: IGetRepositorySecretsParams,) => getRepositorySecrets(
        params.repositoryId
    ).then(data => data.data)
}

/**
 * Get workflow runs
 * @returns runs as swr response
 */
export const useAuthenticatedGetRepositorySecrets = (params: IGetRepositorySecretsParams) => {
    const { workspace } = useWorkspaces()
    if (!workspace) throw new Error('Impossible to fetch workflows without specifying a workspace')

    const fetcher = useAuthenticatedGetWorkflowRunTasksFetcher()

    return useSWR(
        params.repositoryId ? getRepositorySecretsUrl(params.repositoryId) : null,
        () => fetcher(params),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false
        }
    )
}