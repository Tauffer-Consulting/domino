import { type AxiosResponse } from "axios";
import { useCallback } from "react";
import { dominoApiClient } from "services/clients/domino.client";

import { type IGetRepoPiecesResponseInterface } from "./piece.interface";

interface IGetRepoPiecesParams {
  id: string;
}

/**
 * Get pieces for selected repository using GET /pieces-repositories/{id}/pieces
 * @param token auth token (string)
 * @param id repo id
 * @returns pieces
 */
const getRepoIdPieces: (args: {
  params: IGetRepoPiecesParams;
}) => Promise<AxiosResponse<IGetRepoPiecesResponseInterface>> = async ({
  params,
}) => {
  return await dominoApiClient.get(`pieces-repositories/${params.id}/pieces`);
};

/**
 * Get pieces by repo id authenticated fetcher function
 * @param params `{ id: string }`
 * @returns pieces from repo
 */
export const useFetchAuthenticatedGetRepoIdPieces = () => {
  const fetcher = useCallback(async (params: IGetRepoPiecesParams) => {
    return await getRepoIdPieces({ params }).then((data) => data.data);
  }, []);
  return fetcher;
};
