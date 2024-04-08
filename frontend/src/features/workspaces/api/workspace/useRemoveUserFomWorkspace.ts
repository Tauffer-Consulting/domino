import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { toast } from "react-toastify";
import { dominoApiClient } from "services/clients/domino.client";

interface RemoveUserWorkspaceParams {
  userId: string;
}

interface UseRemoveUserFomWorkspace {
  workspaceId?: string;
}

export const useRemoveUserFomWorkspace = (
  { workspaceId }: UseRemoveUserFomWorkspace,
  config: MutationConfig<RemoveUserWorkspaceParams, void> = {},
) => {
  return useMutation({
    mutationFn: async ({ userId }) => {
      if (!workspaceId) throw new Error("No workspace selected");
      await removeUserFomWorkspace({ userId, workspaceId });
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

const removeUserFomWorkspace: (
  params: RemoveUserWorkspaceParams & UseRemoveUserFomWorkspace,
) => Promise<void> = async ({ userId, workspaceId }) => {
  await dominoApiClient.delete(`/workspaces/${workspaceId}/users/${userId}`);
};
