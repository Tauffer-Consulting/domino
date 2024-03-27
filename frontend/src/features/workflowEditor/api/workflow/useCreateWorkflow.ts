import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type IPostWorkflowResponseInterface } from "features/myWorkflows/types";
import { type CreateWorkflowRequest } from "features/workflowEditor/context/types";
import { dominoApiClient } from "services/clients/domino.client";

interface UsePostWorkflow {
  workspaceId: string;
}

type PostWorkflowParams = CreateWorkflowRequest & UsePostWorkflow;

export const useCreateWorkflow = (
  { workspaceId }: UsePostWorkflow,
  config: MutationConfig<CreateWorkflowRequest, IPostWorkflowResponseInterface>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params) =>
      await postWorkflow({ ...params, workspaceId }),
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
}: PostWorkflowParams): Promise<IPostWorkflowResponseInterface> => {
  return await dominoApiClient.post(
    `/workspaces/${workspaceId}/workflows`,
    payload,
  );
};
