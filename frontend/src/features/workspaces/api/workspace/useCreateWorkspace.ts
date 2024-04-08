import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { toast } from "react-toastify";
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
    onError: (e: AxiosError<{ detail: string }>) => {
      const message =
        (e.response?.data?.detail ?? e?.message) || "Something went wrong";

      toast.error(message, {
        toastId: message,
      });
    },
    ...config,
  });
};

const postWorkspaces: (
  params: CreateWorkspaceParams,
) => Promise<CreateWorkspaceResponse> = async (params) => {
  return await dominoApiClient.post(`/workspaces`, params);
};
