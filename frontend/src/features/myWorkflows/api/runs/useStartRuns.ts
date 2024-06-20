import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { type IBatchWorkflowActionResponse } from "features/myWorkflows/types/workflow";
import { toast } from "react-toastify";
import { dominoApiClient } from "services/clients/domino.client";

interface StartRunsParams {
  workflowIds: number[];
}

interface UseStartRuns {
  workspaceId?: string;
}

export const useStartRuns = (
  { workspaceId }: UseStartRuns,
  config: MutationConfig<StartRunsParams, IBatchWorkflowActionResponse> = {},
) => {
  return useMutation({
    mutationFn: async ({ workflowIds }) => {
      if (!workflowIds) throw new Error("No workflow selected");
      return await postWorkflowRunIds({ workflowIds, workspaceId });
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

const postWorkflowRunIds = async ({
  workflowIds,
  workspaceId,
}: StartRunsParams & UseStartRuns): Promise<IBatchWorkflowActionResponse> => {
  return await dominoApiClient.post(
    `/batch/workspaces/${workspaceId}/workflows/runs`,
    workflowIds,
  );
};
