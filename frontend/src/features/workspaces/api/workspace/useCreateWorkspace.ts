import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation } from "@tanstack/react-query";
import { dominoApiClient } from "services/clients/domino.client";

type CreateWorkspaceResponse = Record<string, any>;

export interface CreateWorkspaceParams {
  name: string;
}

export const useCreateWorkspace = (
  config: MutationConfig<CreateWorkspaceParams, CreateWorkspaceResponse> = {},
) => {
  return useMutation({
    mutationFn: async (params) => await postWorkspaces(params),
    ...config,
  });
};

const postWorkspaces: (
  params: CreateWorkspaceParams,
) => Promise<CreateWorkspaceResponse> = async (params) => {
  return await dominoApiClient.post(`/workspaces`, params);
};
