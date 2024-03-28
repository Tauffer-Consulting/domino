import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation } from "@tanstack/react-query";
import { dominoApiClient } from "services/clients/domino.client";

interface LoginParams {
  email: string;
  password: string;
}

interface LoginResponse {
  user_id: string;
  group_ids: number[];
  access_token: string;
  token_expires_in: number;
}

export const useAuthLogin = (
  config: MutationConfig<LoginParams, LoginResponse> = {},
) => {
  return useMutation({
    mutationFn: async ({ email, password }) =>
      await postAuthLogin({ email, password }),
    ...config,
  });
};

const postAuthLogin = async ({
  email,
  password,
}: LoginParams): Promise<LoginResponse> => {
  return await dominoApiClient.post("/auth/login", { email, password });
};
