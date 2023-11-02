import { type AxiosResponse } from "axios";
import { dominoApiClient } from "services/clients/domino.client";

interface IPostAuthRegisterParams {
  email: string;
  password: string;
}

interface IPostAuthRegisterResponseInterface {
  user_id: string;
  email: string;
  token_expires_in: number;
  groups: Array<{ group_id: number; group_name: string }>;
}

/**
 * Authenticate the user using POST /auth/register
 * @param params `{ email: string, password: string }`
 * @returns access token
 */
export const postAuthRegister: (
  params: IPostAuthRegisterParams,
) => Promise<AxiosResponse<IPostAuthRegisterResponseInterface>> = async (
  params,
) => {
  return await dominoApiClient.post("/auth/register", params);
};

export const postAuthRegisterMockResponse: IPostAuthRegisterResponseInterface =
  {
    user_id: "some_id",
    email: "some@email.com",
    token_expires_in: 3600,
    groups: [{ group_id: 0, group_name: "some group" }],
  };
