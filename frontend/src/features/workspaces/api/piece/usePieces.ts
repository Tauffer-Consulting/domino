import { type QueryConfig } from "@services/clients/react-query.client";
import { skipToken, useQuery } from "@tanstack/react-query";
import { dominoApiClient } from "services/clients/domino.client";

interface GetRepoPiecesParams {
  repositoryId?: number;
}

export const usePieces = (
  { repositoryId }: GetRepoPiecesParams,
  config: QueryConfig<Piece[]> = {},
) => {
  return useQuery({
    queryKey: ["PIECES", repositoryId],
    queryFn: repositoryId
      ? async () => await getPieces(repositoryId)
      : skipToken,
    ...config,
  });
};

const getPieces = async (repositoryId: number): Promise<Piece[]> =>
  await dominoApiClient.get(`pieces-repositories/${repositoryId}/pieces`);
