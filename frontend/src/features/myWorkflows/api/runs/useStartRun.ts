import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { type IPostWorkflowRunIdResponseInterface } from "features/myWorkflows/types/workflow";
import { toast } from "react-toastify";
import { dominoApiClient } from "services/clients/domino.client";

interface StartRunParams {
  workflowId: string;
}

interface UseStartRun {
  workspaceId?: string;
}

export const useStartRun = (
  { workspaceId }: UseStartRun,
  config: MutationConfig<
    StartRunParams,
    IPostWorkflowRunIdResponseInterface
  > = {},
) => {
  return useMutation({
    mutationFn: async ({ workflowId }) => {
      if (!workflowId) throw new Error("no workspace selected");
      return await postWorkflowRunId({ workflowId, workspaceId });
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
