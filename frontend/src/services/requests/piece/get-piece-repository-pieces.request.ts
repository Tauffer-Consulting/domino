import { AxiosResponse } from 'axios'
import { useCallback } from 'react'
import { dominoApiClient } from '../../clients/domino.client'
import { IGetRepoOperatorsResponseInterface } from './operator.interface'

interface IGetRepoOperatorsParams {
  id: string
}

/**
 * Get pieces for selected repository using GET /pieces-repositories/{id}/pieces
 * @param token auth token (string)
 * @param id repo id
 * @returns pieces
 */
const getRepoIdOperators: (args: {
  params: IGetRepoOperatorsParams
}
) => Promise<AxiosResponse<IGetRepoOperatorsResponseInterface>> = ({ params }) => {
  return dominoApiClient.get(`pieces-repositories/${params.id}/pieces`)
}


/**
 * Get pieces by repo id authenticated fetcher function
 * @param params `{ id: string }`
 * @returns pieces from repo
 */
export const useFetchAuthenticatedGetRepoIdOperators = () => {
  const fetcher = useCallback(async (params: IGetRepoOperatorsParams) => {
    return getRepoIdOperators({ params }).then(data => data.data)
  }, [])
  return fetcher
}

