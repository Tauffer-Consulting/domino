import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { toast } from "react-toastify";
import { dominoApiClient } from "services/clients/domino.client";

export interface DeleteWorkspaceParams {
  workspaceId: string;
}

export const useDeleteWorkspace = (
  config: MutationConfig<DeleteWorkspaceParams, void> = {},
) => {
  return useMutation({
    mutationFn: async ({ workspaceId }) => {
      await deleteWorkspace({ workspaceId });
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

const deleteWorkspace = async ({
  workspaceId,
}: DeleteWorkspaceParams): Promise<void> => {
  await dominoApiClient.delete(`/workspaces/${workspaceId}`);
};
