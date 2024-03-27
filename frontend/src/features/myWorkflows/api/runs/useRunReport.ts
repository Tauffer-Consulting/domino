import { type QueryConfig } from "@services/clients/react-query.client";
import { skipToken, useQuery } from "@tanstack/react-query";
import { type taskState } from "features/myWorkflows/types";
import { dominoApiClient } from "services/clients/domino.client";

interface WorkflowRunReportParams {
  workflowId: string;
  runId: string;
  workspaceId: string;
}

interface WorkflowRunReportResponse {
  data: Array<{
    base64_content: string;
    file_type: string;
    piece_name: string;
    dag_id: string;
    duration: number;
    start_date: string;
    end_date: string;
    execution_date: string;
    task_id: string;
    state: taskState;
  }>;
}

export const useRunReport = (
  { runId, workflowId, workspaceId }: Partial<WorkflowRunReportParams>,
  config: QueryConfig<WorkflowRunReportResponse> = {},
) => {
  return useQuery({
    queryKey: ["RUN-REPORT", workspaceId, workflowId, runId],
    queryFn: workspaceId
      ? async () =>
          await getWorkflowRunReport({ runId, workflowId, workspaceId })
      : skipToken,
    ...config,
  });
};

const getWorkflowRunReport = async ({
  workspaceId,
  workflowId,
  runId,
}: Partial<WorkflowRunReportParams>): Promise<WorkflowRunReportResponse> => {
  return await dominoApiClient.get(
    `/workspaces/${workspaceId}/workflows/${workflowId}/runs/${runId}/tasks/report`,
  );
};
