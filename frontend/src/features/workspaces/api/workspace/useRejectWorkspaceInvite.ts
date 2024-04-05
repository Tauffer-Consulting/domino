import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation } from "@tanstack/react-query";
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
    ...config,
  });
};

const rejectWorkspaceInvite: (
  params: RejectWorkspaceInviteParams,
) => Promise<void> = async ({ workspaceId }) => {
  await dominoApiClient.post(`/workspaces/${workspaceId}/invites/reject`, null);
};
