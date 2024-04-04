import { useWorkspaces } from "@context/workspaces";
import { Container, Paper, Typography } from "@mui/material";
import { NoDataOverlay } from "components/NoDataOverlay";
import { useRunTaskLogs, useRunTaskResult } from "features/myWorkflows/api";
import React, { useCallback, useMemo, useState } from "react";

import { CustomTabMenu, CustomTabPanel } from "./CustomTabMenu";
import { TaskDetails } from "./CustomTabMenu/TaskDetail";
import { TaskLogs } from "./CustomTabMenu/TaskLogs";
import { TaskResult } from "./CustomTabMenu/TaskResult";

import { type IWorkflowRunTaskExtended } from ".";

interface Props {
  autoUpdate: boolean;
  runId?: string;
  nodeId?: string;
  tasks?: IWorkflowRunTaskExtended[];
  workflowId?: string;
}

export const WorkflowRunDetail: React.FC<Props> = ({
  autoUpdate,
  runId,
  nodeId,
  tasks,
  workflowId,
}) => {
  const [value, setValue] = useState(0);

  const taskData = useMemo(() => {
    if (nodeId) {
      const task = tasks?.find((task) => {
        return task.task_id === nodeId;
      });

      return task;
    }
  }, [runId, nodeId, tasks]);

  const { workspace } = useWorkspaces();

  const { data: taskLogs } = useRunTaskLogs(
    {
      workspaceId: workspace?.id,
      workflowId,
      runId,
      taskId: taskData?.task_id,
      taskTryNumber: String(taskData?.try_number),
    },
    {
      refetchInterval: autoUpdate ? 1500 : undefined,
    },
  );

  const { data: taskResult, isLoading } = useRunTaskResult({
    workspaceId: workspace?.id,
    workflowId,
    runId,
    taskId: taskData?.state === "success" ? taskData?.task_id : undefined,
    taskTryNumber: String(taskData?.try_number),
  });

  const handleChange = useCallback(
    (_event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
    },
    [],
  );

  return (
    <Paper sx={{ height: "82vh" }}>
      {runId ? (
        nodeId ? (
          <CustomTabMenu
            tabTitles={["Details", "Logs", "Result"]}
            value={value}
            handleChange={handleChange}
          >
            {taskData && (
              <>
                <CustomTabPanel index={0} value={value}>
                  <TaskDetails taskData={taskData} />
                </CustomTabPanel>
                <CustomTabPanel index={1} value={value}>
                  <TaskLogs logs={taskLogs?.data ?? []} />
                </CustomTabPanel>
                <CustomTabPanel index={2} value={value}>
                  <TaskResult
                    isLoading={isLoading}
                    base64_content={taskResult?.base64_content}
                    file_type={taskResult?.file_type}
                  />
                </CustomTabPanel>
              </>
            )}
          </CustomTabMenu>
        ) : (
          <CustomTabMenu
            tabTitles={["Details", "Logs", "Result"]}
            value={value}
            handleChange={handleChange}
          >
            <Container
              sx={{
                height: "90%",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h2">Select a domino piece</Typography>
            </Container>
          </CustomTabMenu>
        )
      ) : (
        <NoDataOverlay />
      )}
    </Paper>
  );
};
