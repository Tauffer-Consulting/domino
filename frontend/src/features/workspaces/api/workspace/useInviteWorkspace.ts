import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { toast } from "react-toastify";
import { dominoApiClient } from "services/clients/domino.client";

interface InviteWorkspaceParams {
  userEmail: string;
  permission: string;
}

interface UseWorkspaceInvite {
  workspaceId?: string;
}

export const useInviteWorkspace = (
  { workspaceId }: UseWorkspaceInvite,
  config: MutationConfig<InviteWorkspaceParams, void> = {},
) => {
  return useMutation({
    mutationFn: async ({ permission, userEmail }) => {
      if (!workspaceId) throw new Error("No workspace selected");
      await inviteWorkspace({ workspaceId, permission, userEmail });
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

const inviteWorkspace = async (
  params: InviteWorkspaceParams & UseWorkspaceInvite,
): Promise<void> => {
  await dominoApiClient.post(`/workspaces/${params.workspaceId}/invites`, {
    user_email: params.userEmail,
    permission: params.permission,
  });
};
