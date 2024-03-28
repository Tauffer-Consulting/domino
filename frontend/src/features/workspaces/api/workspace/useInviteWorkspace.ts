import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation } from "@tanstack/react-query";
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
    mutationKey: ["SEND-INVITE"],
    mutationFn: async ({ permission, userEmail }) => {
      if (!workspaceId) throw new Error("No workspace selected");
      await inviteWorkspace({ workspaceId, permission, userEmail });
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
