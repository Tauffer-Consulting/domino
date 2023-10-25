import { type AxiosResponse } from "axios";
import { type CreateWorkflowPieceRequest } from "features/workflowEditor/context/types";
import { type IPostWorkflowPieceResponseInterface } from "features/workflows/types";
import { dominoApiClient } from "services/clients/domino.client";

export interface IPostWorkflowPieceParams extends CreateWorkflowPieceRequest {
  workspace_id: string;
}

/**
 * Create workflow using POST /workflow
 * @returns ?
 */
const postWorkflowPiece: (
  payload: IPostWorkflowPieceParams,
) => Promise<AxiosResponse<IPostWorkflowPieceResponseInterface>> = async (
  payload,
) => {
  return await dominoApiClient.post(
    `/workspaces/${payload.workspace_id}/workflowPiece`,
    payload,
  );
};

/**
 * Create authenticated workflow
 * @param params `{ id: string, data: Record<string, unknown> }``
 * @returns crate workflow function
 */
export const useAuthenticatedPostWorkflowPiece = () => {
  const fetcher = async (params: IPostWorkflowPieceParams) =>
    await postWorkflowPiece(params).then((data) => data.data);

  return fetcher;
};
