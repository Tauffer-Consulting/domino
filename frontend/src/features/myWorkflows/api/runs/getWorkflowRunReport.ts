import { type AxiosResponse } from "axios";
import { useWorkspaces } from "context/workspaces";
import { type taskState } from "features/myWorkflows/types";
import { dominoApiClient } from "services/clients/domino.client";
import useSWR from "swr";

export interface IGetWorkflowRunResultReportParams {
  workflowId: string;
  runId: string;
}

export interface IGetWorkflowRunResultReportResponse {
  base64_content: string;
  file_type: string;
  piece_name: string;
  dag_id: string;
  duration: number;
  start_date: string;
  end_date: string;
  execution_date: string;
  task_id: string;
  state: taskState;
}

const getWorkflowRunResultReportUrl = ({
  workspace,
  workflowId,
  runId,
}: Partial<IGetWorkflowRunResultReportParams & { workspace: string }>) => {
  if (workspace && workflowId && runId) {
    return `/workspaces/${workspace}/workflows/${workflowId}/runs/${runId}/tasks/report`;
  } else {
    return null;
  }
};

/**
 * Get workflows using GET /workflows
 * @returns workflow
 */
const getWorkflowRunResultReport: ({
  workspace,
  workflowId,
  runId,
}: Partial<
  IGetWorkflowRunResultReportParams & { workspace: string }
>) => Promise<
  | AxiosResponse<{
      data: IGetWorkflowRunResultReportResponse[];
    }>
  | undefined
> = async ({ workspace, workflowId, runId }) => {
  if (workspace && workflowId && runId) {
    const url = getWorkflowRunResultReportUrl({
      workspace,
      workflowId,
      runId,
    });
    if (url) return await dominoApiClient.get(url);
  }
};

/**
 * Get workflow runs
 * @returns runs as swr response
 */
export const useAuthenticatedGetWorkflowRunResultReport = (
  params: Partial<IGetWorkflowRunResultReportParams>,
) => {
  const { workspace } = useWorkspaces();
  if (!workspace)
    throw new Error(
      "Impossible to fetch workflows without specifying a workspace",
    );

  const url = getWorkflowRunResultReportUrl({
    workspace: workspace.id,
    ...params,
  });

  return useSWR(
    url,
    async () =>
      await getWorkflowRunResultReport({
        workspace: workspace.id,
        ...params,
      }).then((data) => data?.data),
  );
};
