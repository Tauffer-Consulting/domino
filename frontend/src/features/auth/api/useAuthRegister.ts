import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation } from "@tanstack/react-query";
import { dominoApiClient } from "services/clients/domino.client";

interface RegisterParams {
  email: string;
  password: string;
}

interface RegisterResponse {
  user_id: string;
  email: string;
  token_expires_in: number;
  groups: Array<{ group_id: number; group_name: string }>;
}

export const useAuthRegister = (
  config: MutationConfig<RegisterParams, RegisterResponse> = {},
) => {
  return useMutation({
    mutationFn: async (params) => await postAuthRegister(params),
    ...config,
  });
};

const postAuthRegister = async ({
  email,
  password,
}: RegisterParams): Promise<RegisterResponse> => {
  return await dominoApiClient.post("/auth/register", { email, password });
};
