import { Container, Paper, Typography } from "@mui/material";
import { NoDataOverlay } from "components/NoDataOverlay";
import {
  useAuthenticatedGetWorkflowRunTaskLogs,
  useAuthenticatedGetWorkflowRunTaskResult,
} from "features/workflows/api";
import React, { useCallback, useMemo, useState } from "react";
import { useInterval } from "utils";

import { CustomTabMenu, CustomTabPanel } from "./CustomTabMenu";
import { TaskDetails } from "./CustomTabMenu/TaskDetail";
import { TaskLogs } from "./CustomTabMenu/TaskLogs";
import { TaskResult } from "./CustomTabMenu/TaskResult";

import { type IWorkflowRunTaskExtended } from ".";

interface Props {
  runId: string | null;
  nodeId: string | null;
  tasks: IWorkflowRunTaskExtended[] | null;
  workflowId: string;
  autoUpdate: boolean;
}

export const WorkflowRunDetail: React.FC<Props> = ({
  runId,
  nodeId,
  tasks,
  workflowId,
  autoUpdate,
}) => {
  const [value, setValue] = useState(0);

  const taskData = useMemo(() => {
    if (nodeId) {
      const task = tasks?.find((task) => {
        return task.task_id === nodeId;
      });

      return task;
    }
  }, [nodeId, tasks]);

  const { data: taskLogs } = useAuthenticatedGetWorkflowRunTaskLogs({
    runId: runId ?? "",
    taskId: taskData?.task_id ?? "",
    taskTryNumber: String(taskData?.try_number) ?? "",
    workflowId,
  });

  const {
    data: taskResult,
    isLoading,
    mutate,
  } = useAuthenticatedGetWorkflowRunTaskResult({
    runId: runId ?? "",
    taskId: taskData?.task_id ?? "",
    taskTryNumber: String(taskData?.try_number) ?? "",
    workflowId,
  });

  const handleChange = useCallback(
    (_event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
    },
    [],
  );

  useInterval(mutate, 1000, autoUpdate);

  return (
    <Paper sx={{ height: "46vh" }}>
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
