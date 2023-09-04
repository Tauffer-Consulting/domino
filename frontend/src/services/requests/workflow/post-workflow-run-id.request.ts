// TODO move to /runs
import { type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces/workspaces.context";

import { dominoApiClient } from "../../clients/domino.client";

import { type IPostWorkflowRunIdResponseInterface } from "./workflow.interface";

interface IPostWorkflowRunIdParams {
  id: string;
}

const postWorkflowRunUrl = (workspaceId: string, id: string) =>
  `/workspaces/${workspaceId}/workflows/${id}/runs`;

/**
 * Run workflow by id using /workflow/run/:id
 * @returns workflow run result
 */
const postWorkflowRunId: (
  workspaceId: string,
  params: IPostWorkflowRunIdParams,
) => Promise<AxiosResponse<IPostWorkflowRunIdResponseInterface>> = async (
  workspaceId,
  params,
) => {
  return await dominoApiClient.post(
    postWorkflowRunUrl(workspaceId, params.id),
    null,
  );
};

/**
 * Run workflow by id fetcher fn
 * @param params `{ id: string }`
 */
export const useAuthenticatedPostWorkflowRunId = () => {
  const { workspace } = useWorkspaces();

  if (!workspace)
    throw new Error(
      "Impossible to run workflows without specifying a workspace",
    );

  const fetcher = async (params: IPostWorkflowRunIdParams) =>
    await postWorkflowRunId(workspace.id, params).then((data) => data);

  return fetcher;
};
