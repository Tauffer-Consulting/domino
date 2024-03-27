import { type IWorkflowRunTasks } from "@features/myWorkflows/types";
import { type QueryConfig } from "@services/clients/react-query.client";
import { useQuery } from "@tanstack/react-query";
import { dominoApiClient } from "services/clients/domino.client";

interface WorkflowRunTasksParams {
  workspaceId: string;
  workflowId: string;
  runId: string;
  page: number;
  pageSize: number;
}

interface WorkflowRunTasksResponse {
  data?: IWorkflowRunTasks[];
  metadata?: PaginationMetadata;
}

export const useRunTasks = (
  {
    workspaceId,
    workflowId,
    runId,
    page = 0,
    pageSize = 10,
  }: WorkflowRunTasksParams,
  config: QueryConfig<WorkflowRunTasksResponse> = {},
) => {
  return useQuery({
    queryKey: ["RUN-TASKS", workspaceId, workflowId, runId, page, pageSize],
    queryFn: async () =>
      await getWorkflowRunTasks({
        workspaceId,
        workflowId,
        runId,
        page,
        pageSize,
      }),
    ...config,
  });
};

const getWorkflowRunTasks = async ({
  workspaceId,
  workflowId,
  runId,
  page,
  pageSize,
}: WorkflowRunTasksParams): Promise<WorkflowRunTasksResponse> => {
  return await dominoApiClient.get(
    `/workspaces/${workspaceId}/workflows/${workflowId}/runs/${runId}/tasks?page=${page}&page_size=${pageSize}`,
  );
};
