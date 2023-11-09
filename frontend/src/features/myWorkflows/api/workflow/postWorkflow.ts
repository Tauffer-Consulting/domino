import { type AxiosResponse } from "axios";
import { type CreateWorkflowRequest } from "features/workflowEditor/context/types";
import { type IPostWorkflowResponseInterface } from "features/myWorkflows/types";
import { dominoApiClient } from "services/clients/domino.client";

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
