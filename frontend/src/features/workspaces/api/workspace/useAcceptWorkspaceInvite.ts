import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { toast } from "react-toastify";
import { dominoApiClient } from "services/clients/domino.client";

interface AcceptWorkspaceInviteParams {
  workspaceId: string;
}

export const useAcceptWorkspaceInvite = (
  config: MutationConfig<AcceptWorkspaceInviteParams, void> = {},
) => {
  return useMutation({
    mutationFn: async (params) => {
      await acceptWorkspaceInvite(params);
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

const acceptWorkspaceInvite = async ({
  workspaceId,
}: AcceptWorkspaceInviteParams): Promise<void> => {
  await dominoApiClient.post(`/workspaces/${workspaceId}/invites/accept`, null);
};
