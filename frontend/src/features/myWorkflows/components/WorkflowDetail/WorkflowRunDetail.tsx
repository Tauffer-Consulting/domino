import { Container, Paper, Typography } from "@mui/material";
import { NoDataOverlay } from "components/NoDataOverlay";
import {
  useAuthenticatedGetWorkflowRunTaskLogs,
  useAuthenticatedGetWorkflowRunTaskResult,
} from "features/myWorkflows/api";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { type KeyedMutator } from "swr";

import { CustomTabMenu, CustomTabPanel } from "./CustomTabMenu";
import { TaskDetails } from "./CustomTabMenu/TaskDetail";
import { TaskLogs } from "./CustomTabMenu/TaskLogs";
import { TaskResult } from "./CustomTabMenu/TaskResult";

import { type IWorkflowRunTaskExtended } from ".";

interface Props {
  runId?: string;
  nodeId?: string;
  tasks?: IWorkflowRunTaskExtended[];
  workflowId?: string;
}

export interface WorkflowRunDetailRef {
  refreshTaskResults: KeyedMutator<
    | {
        base64_content: string;
        file_type: string;
      }
    | undefined
  >;
  refreshTaskLogs: KeyedMutator<
    | {
        data: string[];
      }
    | undefined
  >;
}

export const WorkflowRunDetail = forwardRef<WorkflowRunDetailRef, Props>(
  ({ runId, nodeId, tasks, workflowId }, ref) => {
    const [value, setValue] = useState(0);

    const taskData = useMemo(() => {
      if (nodeId) {
        const task = tasks?.find((task) => {
          return task.task_id === nodeId;
        });

        return task;
      }
    }, [runId, nodeId, tasks]);

    const { data: taskLogs, mutate: refreshTaskLogs } =
      useAuthenticatedGetWorkflowRunTaskLogs({
        runId: runId ?? "",
        taskId: taskData?.task_id ?? "",
        taskTryNumber: String(taskData?.try_number) ?? "",
        workflowId: workflowId ?? "",
      });

    const {
      data: taskResult,
      isLoading,
      mutate: refreshTaskResults,
    } = useAuthenticatedGetWorkflowRunTaskResult({
      runId,
      taskId: taskData?.state === "success" ? taskData?.task_id : undefined,
      taskTryNumber: String(taskData?.try_number),
      workflowId,
    });

    const handleChange = useCallback(
      (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
      },
      [],
    );

    useImperativeHandle(ref, () => ({
      refreshTaskResults,
      refreshTaskLogs,
    }));

    return (
      <Paper sx={{ height: "86vh" }}>
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
  },
);

WorkflowRunDetail.displayName = "WorkflowRunDetail";
