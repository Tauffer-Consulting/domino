// TODO move to /runs
import { AxiosError, type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces";
import { type IPostWorkflowRunIdResponseInterface } from "features/workflows/types/workflow";
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

  if (!workspace)
    throw new Error(
      "Impossible to run workflows without specifying a workspace",
    );

  const fetcher = async (params: IPostWorkflowRunIdParams) =>
    await postWorkflowRunId(workspace.id, params)
      .then((data) => {
        toast.success("Workflow started");
        return data;
      })
      .catch((e) => {
        if (e instanceof AxiosError) {
          if (e?.response?.status === 403) {
            toast.error("You are not allowed to run this workflow.");
          } else if (e?.response?.status === 404) {
            toast.error("Workflow not found.");
          } else if (e?.response?.status === 409) {
            toast.error("Workflow is not in a valid state. ");
          } else {
            throw e;
          }
        }
        throw e;
      });

  return fetcher;
};
