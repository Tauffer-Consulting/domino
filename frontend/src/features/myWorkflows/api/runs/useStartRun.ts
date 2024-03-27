import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type IPostWorkflowRunIdResponseInterface } from "features/myWorkflows/types/workflow";
import { dominoApiClient } from "services/clients/domino.client";

interface StartRunParams {
  workflowId: string;
}

interface UseStartRun {
  workspaceId: string;
}

export const useStartRun = (
  { workspaceId }: UseStartRun,
  config: MutationConfig<
    StartRunParams & UseStartRun,
    IPostWorkflowRunIdResponseInterface
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workflowId }) =>
      await postWorkflowRunId({ workflowId, workspaceId }),
    onSuccess: async (_, { workflowId }) => {
      await queryClient.invalidateQueries({
        queryKey: ["RUNS", workspaceId, workflowId],
      });
    },
    ...config,
  });
};

const postWorkflowRunId = async ({
  workflowId,
  workspaceId,
}: StartRunParams &
  UseStartRun): Promise<IPostWorkflowRunIdResponseInterface> => {
  return await dominoApiClient.post(
    `/workspaces/${workspaceId}/workflows/${workflowId}/runs`,
    null,
  );
};
