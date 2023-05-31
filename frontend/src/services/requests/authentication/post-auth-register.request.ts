import { AxiosResponse } from 'axios'
import { dominoApiClient } from '../../clients/domino.client'

interface IPostAuthRegisterParams {
  email: string
  password: string
}

interface IPostAuthRegisterResponseInterface {
  id: string
  email: string
  groups: { group_id: number; group_name: string }[]
}

/**
 * Authenticate the user using POST /auth/register
 * @param params `{ email: string, password: string }`
 * @returns access token
 */
export const postAuthRegister: (
  params: IPostAuthRegisterParams
) => Promise<AxiosResponse<IPostAuthRegisterResponseInterface>> = (params) => {
  return dominoApiClient.post('/auth/register', params)
}

export const postAuthRegisterMockResponse: IPostAuthRegisterResponseInterface =
{
  id: 'some_id',
  email: 'some@email.com',
  groups: [{ group_id: 0, group_name: 'some group' }]
}
