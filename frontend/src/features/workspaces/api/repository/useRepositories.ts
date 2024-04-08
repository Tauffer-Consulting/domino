import { type QueryConfig } from "@services/clients/react-query.client";
import { skipToken, useQuery } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { toast } from "react-toastify";
import { dominoApiClient } from "services/clients/domino.client";

interface PiecesRepositoriesParams {
  page?: number;
  page_size?: number;
  name__like?: string;
  path__like?: string;
  version?: string;
  source?: "github" | "default";
}

interface PiecesRepositories {
  data: Repository[];
  metadata: PaginationMetadata;
}

export const useRepositories = (
  {
    workspaceId,
    ...filters
  }: PiecesRepositoriesParams & { workspaceId?: string },
  config: QueryConfig<PiecesRepositories | undefined> = {},
) => {
  return useQuery({
    queryKey: ["REPOSITORIES", workspaceId, filters],
    queryFn: workspaceId
      ? async () => await getPiecesRepositories(filters, workspaceId)
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

const getPiecesRepositories = async (
  { page = 0, page_size = 100, ...filters }: PiecesRepositoriesParams,
  workspace: string,
): Promise<PiecesRepositories | undefined> => {
  return await dominoApiClient.get(
    getPiecesRepositoriesUrl({ page, page_size, ...filters }, workspace),
  );
};

const getPiecesRepositoriesUrl = (
  filters: PiecesRepositoriesParams,
  workspace: string,
) => {
  const query = new URLSearchParams();
  query.set("workspace_id", workspace);
  for (const [key, value] of Object.entries(filters)) {
    query.set(key, value);
  }
  return `/pieces-repositories?${query.toString()}`;
};
