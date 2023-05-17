import { useCallback } from 'react'
import { AxiosResponse } from 'axios'
import useSWR from 'swr'
import { dominoApiClient } from 'services/clients/domino.client'
import { IGetWorkspaceUsersResponse } from './workspaces.interface'
import { useAuthentication } from 'context/authentication'

interface IGetWorkspaceMemers {
    workspaceId: string
    page: number
    pageSize: number
}

/**
 * Get workspaces using GET /workspaces
 * @returns workspaces
 */
const getWorkspaceUsers: (
    workspaceId: string,
    page: number,
    pageSize: number
) => Promise<AxiosResponse<IGetWorkspaceUsersResponse>> = (workspaceId, page, pageSize) => {
    return dominoApiClient.get(`/workspaces/${workspaceId}/users?page=${page}&page_size=${pageSize}`)
}

/**
 * Get workspaces
 * @returns workspaces as swr response
 */
export const useAuthenticatedGetWorkspaceUsers = (params: IGetWorkspaceMemers) => {

    const fetcher = useCallback(async (params: IGetWorkspaceMemers) => {
        return getWorkspaceUsers(params.workspaceId, params.page, params.pageSize).then(data => data.data)
    }, [])

    const auth = useAuthentication()

    if (!params.page){
        params.page = 0
    }
    if (!params.pageSize){
        params.pageSize = 10
    }
    return useSWR((auth.isLogged && params.workspaceId) ? `/workspaces/${params.workspaceId}/users?page=${params.page}&page_size=${params.pageSize}` : null, () => fetcher(params), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    })
}
