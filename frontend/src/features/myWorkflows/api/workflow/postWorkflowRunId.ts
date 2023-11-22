// TODO move to /runs
import { AxiosError, type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces";
import { type IPostWorkflowRunIdResponseInterface } from "features/myWorkflows/types/workflow";
import { toast } from "react-toastify";
import { dominoApiClient } from "services/clients/domino.client";

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

  if (!workspace) return async (_params: IPostWorkflowRunIdParams) => {};

  const fetcher = async (params: IPostWorkflowRunIdParams) =>
    await postWorkflowRunId(workspace.id, params)
      .then((data) => {
        toast.success("Workflow started");
        return data;
      })
      .catch((e) => {
        if (e instanceof AxiosError) {
          console.error(e);
        } else {
          throw e;
        }
      });

  return fetcher;
};
