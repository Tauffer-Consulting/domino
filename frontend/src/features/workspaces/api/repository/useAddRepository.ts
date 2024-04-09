import { type repositorySource } from "@context/workspaces/types";
import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { toast } from "react-toastify";
import { dominoApiClient } from "services/clients/domino.client";

export interface AddRepositoryParams {
  source: repositorySource | string;
  path: string;
  version: string;
  url: string;
}

export interface AddRepositoryResponse {
  id: number;
  name: string;
  created_at: string;
  source: repositorySource | string;
  label: string;
  path: string;
  version: string;
  workspace_id: number;
}

interface UseAddRepository {
  workspaceId?: string;
}

export const useAddRepository = (
  { workspaceId }: UseAddRepository,
  config: MutationConfig<AddRepositoryParams, AddRepositoryResponse> = {},
) => {
  return useMutation({
    mutationFn: async (params) => {
      if (!workspaceId) {
        throw new Error("No workspace selected");
      }
      return await postPiecesRepository({
        workspace_id: workspaceId,
        ...params,
      });
    },
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

const postPiecesRepository = async (
  params: AddRepositoryParams & { workspace_id: string },
): Promise<AddRepositoryResponse> => {
  return await dominoApiClient.post("/pieces-repositories", params);
};
