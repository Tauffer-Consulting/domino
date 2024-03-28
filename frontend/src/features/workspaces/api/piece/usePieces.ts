import { type QueryConfig } from "@services/clients/react-query.client";
import { useQueries } from "@tanstack/react-query";
import { dominoApiClient } from "services/clients/domino.client";

interface GetRepoPiecesParams {
  repositoryIds?: string[];
}

export const usePieces = (
  { repositoryIds }: GetRepoPiecesParams,
  config: QueryConfig<Piece[][]> = {},
) => {
  return useQueries({
    queries:
      repositoryIds?.map((repositoryId) => ({
        queryKey: ["PIECES", repositoryId],
        queryFn: async () => await getPieces(repositoryId),
      })) ?? [],
    combine: (results) => {
      return {
        data: results
          .flatMap((result) => result.data)
          .filter((data) => data !== undefined) as unknown as Piece[],
        pending: results.some((result) => result.isPending),
      };
    },
    ...config,
  });
};

const getPieces = async (repositoryId: string): Promise<Piece[]> =>
  await dominoApiClient.get(`pieces-repositories/${repositoryId}/pieces`);
