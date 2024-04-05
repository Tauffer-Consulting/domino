import { type IWorkflowRuns } from "@features/myWorkflows/types";
import { type QueryConfig } from "@services/clients/react-query.client";
import { skipToken, useQuery } from "@tanstack/react-query";
import { dominoApiClient } from "services/clients/domino.client";

interface WorkflowRunParams {
  workspaceId?: string;
  workflowId?: string;
  page: number;
  pageSize: number;
}

interface RunsResponse {
  data: IWorkflowRuns[];
  metadata: PaginationMetadata;
}

export const useRuns = (
  { workspaceId, workflowId, page = 0, pageSize = 10 }: WorkflowRunParams,
  config: QueryConfig<RunsResponse> = {},
) => {
  return useQuery({
    queryKey: ["RUNS", workspaceId, workflowId, page, pageSize],
    queryFn:
      !workspaceId || !workflowId
        ? skipToken
        : async () =>
            await getWorkflowRuns({ workspaceId, workflowId, page, pageSize }),
    ...config,
  });
};

const getWorkflowRuns = async ({
  workspaceId,
  workflowId,
  page,
  pageSize,
}: WorkflowRunParams): Promise<RunsResponse> => {
  return await dominoApiClient.get(
    `/workspaces/${workspaceId}/workflows/${workflowId}/runs?page=${page}&page_size=${pageSize}`,
  );
};
