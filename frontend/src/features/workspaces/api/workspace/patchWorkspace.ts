// TODO move to /runs
import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation } from "@tanstack/react-query";
import { dominoApiClient } from "services/clients/domino.client";

interface PatchWorkspaceParams {
  name?: string | null;
  github_access_token?: string | null;
}

interface UseUpdateWorkspace {
  workspaceId: string;
}

export const useUpdateWorkspace = (
  { workspaceId }: UseUpdateWorkspace,
  config: MutationConfig<PatchWorkspaceParams, void> = {},
) => {
  return useMutation({
    mutationKey: ["WORKSPACE"],
    mutationFn: async (params) => {
      await patchWorkspace({ workspaceId, ...params });
    },
    ...config,
  });
};

const patchWorkspace = async ({
  workspaceId,
  ...params
}: PatchWorkspaceParams & UseUpdateWorkspace): Promise<void> => {
  await dominoApiClient.patch(`/workspaces/${workspaceId}`, params);
};
