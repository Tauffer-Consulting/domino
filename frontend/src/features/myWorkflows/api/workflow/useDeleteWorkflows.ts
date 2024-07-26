import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { type IBatchWorkflowActionResponse } from "features/myWorkflows/types/workflow";
import { toast } from "react-toastify";
import { dominoApiClient } from "services/clients/domino.client";

interface DeleteWorkflowsParams {
  workflowIds: number[];
}

interface UseDeleteWorkflows {
  workspaceId?: string;
}

export const useDeleteWorkflows = (
  { workspaceId }: UseDeleteWorkflows,
  config: MutationConfig<
    DeleteWorkflowsParams,
    IBatchWorkflowActionResponse
  > = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workflowIds }) => {
      if (!workspaceId) throw new Error("No workspace selected");
      return await deleteWorkflowByIds({ workflowIds, workspaceId });
    },
    onSuccess: async (_, { workflowIds }) => {
      await queryClient.invalidateQueries({
        queryKey: ["WORKFLOWS", workspaceId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["WORKFLOW", workspaceId, workflowIds],
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

const deleteWorkflowByIds = async (
  params: DeleteWorkflowsParams & UseDeleteWorkflows,
): Promise<IBatchWorkflowActionResponse> => {
  return await dominoApiClient.delete(
    `/batch/workspaces/${params.workspaceId}/workflows`,
    {
      data: params.workflowIds,
    },
  );
};
