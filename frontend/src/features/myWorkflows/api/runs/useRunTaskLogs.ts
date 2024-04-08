import { type QueryConfig } from "@services/clients/react-query.client";
import { skipToken, useQuery } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { toast } from "react-toastify";
import { dominoApiClient } from "services/clients/domino.client";

interface RunTaskLogsParams {
  workspaceId: string;
  workflowId: string;
  runId: string;
  taskId: string;
  taskTryNumber: string;
}

export interface RunTaskLogsResponse {
  data: string[];
  metadata?: PaginationMetadata;
}

export const useRunTaskLogs = (
  {
    workspaceId,
    workflowId,
    runId,
    taskId,
    taskTryNumber,
  }: Partial<RunTaskLogsParams>,
  config: QueryConfig<RunTaskLogsResponse> = {},
) => {
  return useQuery({
    queryKey: [
      "RUN-TASK-LOGS",
      workspaceId,
      workflowId,
      runId,
      taskId,
      taskTryNumber,
    ],
    queryFn:
      !workspaceId || !workflowId || !runId || !taskId || !taskTryNumber
        ? skipToken
        : async () => {
            try {
              return await getWorkflowRunTaskLogs({
                workspaceId,
                workflowId,
                runId,
                taskId,
                taskTryNumber,
              });
            } catch (e) {
              console.log(e);
              throw e;
            }
          },
    throwOnError(e, _query) {
      const message =
        ((e as AxiosError<{ detail?: string }>).response?.data?.detail ??
          e?.message) ||
        "Something went wrong";

      if (e.response?.status === 404) {
        console.log("Logs not found");
        return false;
      }

      toast.error(message, {
        toastId: message,
      });

      return false;
    },
    ...config,
  });
};

const getWorkflowRunTaskLogs = async ({
  workspaceId,
  workflowId,
  runId,
  taskId,
  taskTryNumber,
}: RunTaskLogsParams): Promise<RunTaskLogsResponse> => {
  return await dominoApiClient.get(
    `/workspaces/${workspaceId}/workflows/${workflowId}/runs/${runId}/tasks/${taskId}/${taskTryNumber}/logs`,
  );
};
