import { type AxiosResponse } from "axios";
import { type IPostWorkflowResponseInterface } from "features/myWorkflows/types";
import {
  type CreateWorkflowRequest,
  type CreateWorkflowPieceData,
} from "features/workflowEditor/context/types";
import { dominoApiClient } from "services/clients/domino.client";

export interface IPostWorkflowParams extends CreateWorkflowRequest {
  workspace_id: string;
}

export interface IPostCreateWorkflowPieceParams
  extends CreateWorkflowPieceData {
  workspace_id: string;
}

/**
 * Create workflow using POST /workflow
 * @returns ?
 */
const postWorkflow: (
  payload: IPostWorkflowParams,
) => Promise<AxiosResponse<IPostWorkflowResponseInterface>> = async (
  payload,
) => {
  return await dominoApiClient.post(
    `/workspaces/${payload.workspace_id}/workflows`,
    payload,
  );
};

/**
 * Create authenticated workflow
 * @param params `{ id: string, data: Record<string, unknown> }``
 * @returns crate workflow function
 */
export const useAuthenticatedPostWorkflow = () => {
  const fetcher = async (params: IPostWorkflowParams) =>
    await postWorkflow(params).then((data) => data.data);

  return fetcher;
};

const postCreateWorkflowPiece: (
  payload: IPostCreateWorkflowPieceParams,
) => Promise<AxiosResponse<any>> = async (payload) => {
  console.log("payload", payload);
  return await dominoApiClient.post(
    `/pieces-repositories/${payload.workspace_id}/pieces`,
    payload,
  );
};

export const useAuthenticatedPostCreateWorkflowPiece = () => {
  const fetcher = async (params: IPostCreateWorkflowPieceParams) =>
    await postCreateWorkflowPiece(params).then((data) => data.data);

  return fetcher;
};
