import { type QueryConfig } from "@services/clients/react-query.client";
import { useQuery, skipToken } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { type IGetWorkflowIdResponseInterface } from "features/myWorkflows/types/workflow";
import { toast } from "react-toastify";
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
