import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { type IBatchWorkflowActionResponse } from "features/myWorkflows/types/workflow";
import { toast } from "react-toastify";
import { dominoApiClient } from "services/clients/domino.client";

interface StopRunsParams {
  workflowIds: number[];
}

interface UseStopRuns {
  workspaceId?: string;
}

export const useStopRuns = (
  { workspaceId }: UseStopRuns,
  config: MutationConfig<StopRunsParams, IBatchWorkflowActionResponse> = {},
) => {
  return useMutation({
    mutationFn: async ({ workflowIds }) => {
      if (!workflowIds) throw new Error("No workflow selected");
      return await postWorkflowStopIds({ workflowIds, workspaceId });
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

const postWorkflowStopIds = async ({
  workflowIds,
  workspaceId,
}: StopRunsParams & UseStopRuns): Promise<IBatchWorkflowActionResponse> => {
  return await dominoApiClient.patch(
    `/batch/workspaces/${workspaceId}/workflows/runs`,
    workflowIds,
  );
};
