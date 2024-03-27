import { type QueryConfig } from "@services/clients/react-query.client";
import { useQuery, skipToken } from "@tanstack/react-query";
import { type IGetWorkflowResponseInterface } from "features/myWorkflows/types/workflow";
import { dominoApiClient } from "services/clients/domino.client";

interface GetWorkflowsParams {
  workspaceId: string;
  page: number;
  pageSize: number;
}

export const useWorkflows = (
  { page = 0, pageSize = 5, workspaceId }: Partial<GetWorkflowsParams>,
  config: QueryConfig<IGetWorkflowResponseInterface> = {},
) => {
  return useQuery({
    queryKey: ["WORKFLOWS", workspaceId, page, pageSize],
    queryFn: workspaceId
      ? async () => await getWorkflows({ workspaceId, page, pageSize })
      : skipToken,
    ...config,
  });
};

const getWorkflows = async ({
  workspaceId,
  page,
  pageSize,
}: GetWorkflowsParams): Promise<IGetWorkflowResponseInterface> =>
  await dominoApiClient.get(
    `/workspaces/${workspaceId}/workflows?page=${page}&page_size=${pageSize}`,
  );
