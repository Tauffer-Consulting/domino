import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation } from "@tanstack/react-query";
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
    ...config,
  });
};

const deleteWorkspace = async ({
  workspaceId,
}: DeleteWorkspaceParams): Promise<void> => {
  await dominoApiClient.delete(`/workspaces/${workspaceId}`);
};
