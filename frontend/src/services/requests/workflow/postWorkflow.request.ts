import { type AxiosResponse } from "axios";
import { type CreateWorkflowRequest } from "context/workflows/types";

import { dominoApiClient } from "../../clients/domino.client";

import { type IPostWorkflowResponseInterface } from "./workflow.interface";

export interface IPostWorkflowParams extends CreateWorkflowRequest {
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
