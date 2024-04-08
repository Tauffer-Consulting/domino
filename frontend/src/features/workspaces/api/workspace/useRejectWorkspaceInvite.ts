import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { toast } from "react-toastify";
import { dominoApiClient } from "services/clients/domino.client";

interface RejectWorkspaceInviteParams {
  workspaceId: string;
}

export const useRejectWorkspaceInvite = (
  config: MutationConfig<RejectWorkspaceInviteParams, void> = {},
) => {
  return useMutation({
    mutationFn: async (params) => {
      await rejectWorkspaceInvite(params);
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

const rejectWorkspaceInvite: (
  params: RejectWorkspaceInviteParams,
) => Promise<void> = async ({ workspaceId }) => {
  await dominoApiClient.post(`/workspaces/${workspaceId}/invites/reject`, null);
};
