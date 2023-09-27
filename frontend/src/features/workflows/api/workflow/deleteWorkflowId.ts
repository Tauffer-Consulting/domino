import { AxiosError, type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces";
import { type IDeleteWorkflowIdResponseInterface } from "features/workflows/types/workflow";
import { toast } from "react-toastify";
import { dominoApiClient } from "services/clients/domino.client";

interface IDeleteWorkflowIdParams {
  id: string;
}

/**
 * Get workflow by id using GET /workflow
 * @returns workflow
 */
const deleteWorkflowId: (
  workspaceId: string,
  params: IDeleteWorkflowIdParams,
) => Promise<AxiosResponse<IDeleteWorkflowIdResponseInterface>> = async (
  workspaceId,
  params,
) => {
  return await dominoApiClient.delete(
    `/workspaces/${workspaceId}/workflows/${params.id}`,
  );
};

/**
 * Delete workflow by id
 * @returns authenticated delete function
 */
export const useAuthenticatedDeleteWorkflowId = () => {
  const { workspace } = useWorkspaces();

  if (!workspace)
    throw new Error(
      "Impossible to fetch delete without specifying a workspace",
    );

  const fetcher = async (params: IDeleteWorkflowIdParams) =>
    await deleteWorkflowId(workspace.id, params)
      .then((data) => {
        toast.success("Workflow deleted.");
        return data;
      })
      .catch((e) => {
        if (e instanceof AxiosError) {
          if (e?.response?.status === 403) {
            toast.error("You are not allowed to delete this workflow.");
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
