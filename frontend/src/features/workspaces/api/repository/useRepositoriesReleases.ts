import { type repositorySource } from "@context/workspaces/types";
import { type QueryConfig } from "@services/clients/react-query.client";
import { skipToken, useQuery } from "@tanstack/react-query";
import { dominoApiClient } from "services/clients/domino.client";

interface RepositoriesReleasesParams {
  source: repositorySource;
  path: string;
  workspaceId: string;
}

interface PieceRepositoryReleases {
  version: string;
  last_modified: string;
}

export const useRepositoriesReleases = (
  { path, source, workspaceId }: Partial<RepositoriesReleasesParams>,
  config: QueryConfig<PieceRepositoryReleases[]>,
) => {
  return useQuery({
    queryKey: ["REPOSITORIES-RELEASES", workspaceId, source, path],
    queryFn:
      !workspaceId || !source || !path
        ? skipToken
        : async () =>
            await getPiecesRepositoriesReleases({
              path,
              source,
              workspaceId,
            }),
    ...config,
  });
};

const getPiecesRepositoriesReleases = async ({
  source,
  path,
  workspaceId,
}: RepositoriesReleasesParams): Promise<PieceRepositoryReleases[]> => {
  const search = new URLSearchParams();
  search.set("source", source);
  search.set("path", path);
  search.set("workspace_id", workspaceId);

  return await dominoApiClient.get(
    `/pieces-repositories/releases?${search.toString()}`,
  );
};
