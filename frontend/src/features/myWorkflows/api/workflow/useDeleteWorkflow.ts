import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { type IDeleteWorkflowIdResponseInterface } from "features/myWorkflows/types/workflow";
import { toast } from "react-toastify";
import { dominoApiClient } from "services/clients/domino.client";

interface DeleteWorkflowParams {
  workflowId: string;
}

interface UseDeleteWorkflow {
  workspaceId?: string;
}

export const useDeleteWorkflow = (
  { workspaceId }: UseDeleteWorkflow,
  config: MutationConfig<DeleteWorkflowParams> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workflowId }) => {
      if (!workspaceId) throw new Error("No workspace selected");
      await deleteWorkflowById({ workflowId, workspaceId });
    },
    onSuccess: async (_, { workflowId }) => {
      await queryClient.invalidateQueries({
        queryKey: ["WORKFLOWS", workspaceId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["WORKFLOW", workspaceId, workflowId],
      });
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

const deleteWorkflowById = async (
  params: DeleteWorkflowParams & UseDeleteWorkflow,
): Promise<IDeleteWorkflowIdResponseInterface> =>
  await dominoApiClient.delete(
    `/workspaces/${params.workspaceId}/workflows/${params.workflowId}`,
  );
