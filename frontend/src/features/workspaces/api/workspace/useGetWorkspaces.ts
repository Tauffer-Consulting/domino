import { type WorkspaceSummary } from "@context/workspaces/types";
import { type QueryConfig } from "@services/clients/react-query.client";
import { useQuery } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { toast } from "react-toastify";
import { dominoApiClient } from "services/clients/domino.client";

export const useGetWorkspaces = (
  config: QueryConfig<WorkspaceSummary[]> = {},
) => {
  return useQuery({
    queryKey: [`WORKSPACES`],
    queryFn: async () => await getWorkspaces(),
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

const getWorkspaces: () => Promise<WorkspaceSummary[]> = async () => {
  return await dominoApiClient.get("/workspaces");
};
