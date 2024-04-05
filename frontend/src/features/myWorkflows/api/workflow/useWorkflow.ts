import { type QueryConfig } from "@services/clients/react-query.client";
import { useQuery, skipToken } from "@tanstack/react-query";
import { type IGetWorkflowIdResponseInterface } from "features/myWorkflows/types/workflow";
import { dominoApiClient } from "services/clients/domino.client";

interface GetWorkflowByIdParams {
  workspaceId: string;
  workflowId: string;
}

export const useWorkflow = (
  { workflowId, workspaceId }: Partial<GetWorkflowByIdParams>,
  config: QueryConfig<IGetWorkflowIdResponseInterface | undefined> = {},
) => {
  return useQuery({
    queryKey: ["WORKFLOW", workspaceId, workflowId],
    queryFn:
      workspaceId && workflowId
        ? async () => await getWorkflowById({ workflowId, workspaceId })
        : skipToken,
    ...config,
  });
};

const getWorkflowById: (
  params: GetWorkflowByIdParams,
) => Promise<IGetWorkflowIdResponseInterface | undefined> = async ({
  workspaceId,
  workflowId,
}) => {
  return await dominoApiClient.get(
    `/workspaces/${workspaceId}/workflows/${workflowId}`,
  );
};
