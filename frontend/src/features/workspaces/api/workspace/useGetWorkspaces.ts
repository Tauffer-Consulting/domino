import { type WorkspaceSummary } from "@context/workspaces/types";
import { useQuery } from "@tanstack/react-query";
import { dominoApiClient } from "services/clients/domino.client";

const getWorkspaces: () => Promise<WorkspaceSummary[]> = async () => {
  return await dominoApiClient.get("/workspaces");
};

export const useGetWorkspaces = () => {
  return useQuery({
    queryKey: [`WORKSPACES`],
    queryFn: async () => await getWorkspaces(),
  });
};
