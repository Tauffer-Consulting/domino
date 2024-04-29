import { type IWorkflowRunTasks } from "@features/myWorkflows/types";
import { type InfiniteQueryConfig } from "@services/clients/react-query.client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { toast } from "react-toastify";
import { dominoApiClient } from "services/clients/domino.client";

interface WorkflowRunTasksParams {
  workspaceId: string;
  workflowId: string;
  runId: string;
  page: number;
  pageSize: number;
}

interface WorkflowRunTasksResponse {
  data: IWorkflowRunTasks[];
  metadata: PaginationMetadata;
}

export const useRunTasks = (
  {
    workspaceId,
    workflowId,
    runId,
  }: Partial<Omit<WorkflowRunTasksParams, "page" | "pageSize">>,
  config: InfiniteQueryConfig<WorkflowRunTasksResponse> = {},
) => {
  return useInfiniteQuery({
    initialPageParam: 0,
    queryKey: ["RUN-TASKS", workspaceId, workflowId, runId],
    queryFn: async ({ pageParam }) => {
      return await getWorkflowRunTasks({
        workspaceId: workspaceId!,
        workflowId: workflowId!,
        runId: runId!,
        page: pageParam,
        pageSize: 100,
      });
    },
    enabled: !!(workspaceId && workflowId && runId),
    getNextPageParam: (res, _, page) =>
      (res.metadata?.last_page ?? 0) > page ? page + 1 : null,
    throwOnError(e, _query) {
      const message =
        ((e as AxiosError<{ detail?: string }>).response?.data?.detail ??
          e?.message) ||
        "Something went wrong";

      toast.error(message, {
        toastId: message,
      });

      return false;
    },
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
