import { AxiosResponse } from 'axios'
import { dominoApiClient } from '../../clients/domino.client'
import { useCallback } from 'react'

interface IDeleteWorkspacesResponseInterface { }

export interface IDeleteWorkspacesParams {
    id: string
}

/**
 * Delete workspace using delete /workspaces/:id
 * @returns ?
 */
const deleteWorkspace: (
    params: IDeleteWorkspacesParams
) => Promise<AxiosResponse<IDeleteWorkspacesResponseInterface>> = (params) => {
    return dominoApiClient.delete(`/workspaces/${params.id}`)
}

export const useAuthenticatedDeleteWorkspaces = () => {
    const fetcher = useCallback((params: IDeleteWorkspacesParams) => deleteWorkspace(params).then(data => { return data }), [])

    return fetcher
}
