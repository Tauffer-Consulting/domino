import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation } from "@tanstack/react-query";
import { dominoApiClient } from "services/clients/domino.client";

interface AcceptWorkspaceInviteParams {
  workspaceId: string;
}

export const useAcceptWorkspaceInvite = (
  config: MutationConfig<AcceptWorkspaceInviteParams, void> = {},
) => {
  return useMutation({
    mutationKey: ["ACCEPT-INVITE"],
    mutationFn: async (params) => {
      await acceptWorkspaceInvite(params);
    },
    ...config,
  });
};

const acceptWorkspaceInvite = async ({
  workspaceId,
}: AcceptWorkspaceInviteParams): Promise<void> => {
  await dominoApiClient.post(`/workspaces/${workspaceId}/invites/accept`, null);
};
