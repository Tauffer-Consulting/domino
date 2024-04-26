import { type QueryConfig } from "@services/clients/react-query.client";
import { useQuery, skipToken } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { type IGetWorkflowResponseInterface } from "features/myWorkflows/types/workflow";
import { toast } from "react-toastify";
import { dominoApiClient } from "services/clients/domino.client";

interface GetWorkflowsParams {
  workspaceId: string | null;
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

const getWorkflows = async ({
  workspaceId,
  page,
  pageSize,
}: GetWorkflowsParams): Promise<IGetWorkflowResponseInterface> =>
  await dominoApiClient.get(
    `/workspaces/${workspaceId}/workflows?page=${page}&page_size=${pageSize}`,
  );
