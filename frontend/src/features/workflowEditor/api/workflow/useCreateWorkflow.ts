import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type IPostWorkflowResponseInterface } from "features/myWorkflows/types";
import { type CreateWorkflowRequest } from "features/workflowEditor/context/types";
import { dominoApiClient } from "services/clients/domino.client";

interface UsePostWorkflow {
  workspaceId?: string;
}

export const useCreateWorkflow = (
  { workspaceId }: UsePostWorkflow,
  config: MutationConfig<
    CreateWorkflowRequest,
    IPostWorkflowResponseInterface
  > = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params) => {
      if (!workspaceId) throw new Error("No workspace selected");
      return await postWorkflow({ ...params, workspaceId });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["WORKFLOWS", workspaceId],
      });
    },
    ...config,
  });
};

const postWorkflow = async ({
  workspaceId,
  ...payload
}: CreateWorkflowRequest &
  UsePostWorkflow): Promise<IPostWorkflowResponseInterface> => {
  return await dominoApiClient.post(
    `/workspaces/${workspaceId}/workflows`,
    payload,
  );
};
