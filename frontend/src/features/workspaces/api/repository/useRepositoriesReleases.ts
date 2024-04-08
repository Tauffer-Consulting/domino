import { type repositorySource } from "@context/workspaces/types";
import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { toast } from "react-toastify";
import { dominoApiClient } from "services/clients/domino.client";

export interface RepositoriesReleasesParams {
  source: repositorySource;
  path: string;
}

export interface RepositoriesReleasesResponse {
  version: string;
  last_modified: string;
}

interface UseRepositoriesReleases {
  workspaceId?: string;
}

export const useRepositoriesReleases = (
  { workspaceId }: UseRepositoriesReleases,
  config: MutationConfig<
    RepositoriesReleasesParams,
    RepositoriesReleasesResponse[]
  > = {},
) => {
  return useMutation({
    mutationFn: async ({ source, path }) => {
      if (!workspaceId) {
        throw new Error("No workspace selected");
      }

      return await getPiecesRepositoriesReleases({
        path,
        source,
        workspaceId,
      });
    },
    onError: (e: AxiosError<{ detail: string }>) => {
      const message =
        (e.response?.data?.detail ?? e?.message) || "Something went wrong";

      toast.error(message, {
        toastId: message,
      });
    },
    ...config,
  });
};

const getPiecesRepositoriesReleases = async ({
  source,
  path,
  workspaceId,
}: RepositoriesReleasesParams & { workspaceId: string }): Promise<
  RepositoriesReleasesResponse[]
> => {
  const search = new URLSearchParams();
  search.set("source", source);
  search.set("path", path);
  search.set("workspace_id", workspaceId);

  return await dominoApiClient.get(
    `/pieces-repositories/releases?${search.toString()}`,
  );
};
