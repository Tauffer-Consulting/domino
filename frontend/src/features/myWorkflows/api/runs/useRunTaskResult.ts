import { type QueryConfig } from "@services/clients/react-query.client";
import { skipToken, useQuery } from "@tanstack/react-query";
import { dominoApiClient } from "services/clients/domino.client";

export interface WorkflowRunTaskResultParams {
  workspaceId: string;
  workflowId: string;
  runId: string;
  taskId: string;
  taskTryNumber: string;
}

export const useRunTaskResult = (
  {
    runId,
    taskId,
    taskTryNumber,
    workflowId,
    workspaceId,
  }: Partial<WorkflowRunTaskResultParams>,
  config: QueryConfig<{ base64_content: string; file_type: string }> = {},
) => {
  return useQuery({
    queryKey: [
      "RUN-TASK-RESULTS",
      workspaceId,
      workflowId,
      runId,
      taskId,
      taskTryNumber,
    ],
    queryFn:
      !runId || !taskId || !taskTryNumber || !workflowId || !workspaceId
        ? skipToken
        : async () =>
            await getWorkflowRunTaskResult({
              runId,
              taskId,
              taskTryNumber,
              workflowId,
              workspaceId,
            }),
    ...config,
  });
};

const getWorkflowRunTaskResult = async ({
  workspaceId,
  workflowId,
  runId,
  taskId,
  taskTryNumber,
}: Partial<WorkflowRunTaskResultParams>): Promise<{
  base64_content: string;
  file_type: string;
}> => {
  return await dominoApiClient.get(
    `/workspaces/${workspaceId}/workflows/${workflowId}/runs/${runId}/tasks/${taskId}/${taskTryNumber}/result`,
  );
};
