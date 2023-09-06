import { type AxiosResponse } from "axios";

import { dominoApiClient } from "../../clients/domino.client";

interface IPostAuthLoginParams {
  email: string;
  password: string;
}

interface IPostAuthLoginResponseInterface {
  user_id: string;
  group_ids: number[];
  access_token: string;
}

/**
 * Authenticate the user using POST /auth/login
 * @param params `{ email: string, password: string }`
 * @returns access token
 */
export const postAuthLogin: (
  params: IPostAuthLoginParams,
) => Promise<AxiosResponse<IPostAuthLoginResponseInterface>> = async (
  params,
) => {
  return await dominoApiClient.post("/auth/login", params);
};

export const postAuthLoginMockResponse: IPostAuthLoginResponseInterface = {
  user_id: "some_id",
  group_ids: [0],
  access_token: "MOCK ACCESS TOKEN",
};
