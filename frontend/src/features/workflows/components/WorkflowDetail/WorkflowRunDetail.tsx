import { Paper } from "@mui/material";
import { NoDataOverlay } from "components/NoDataOverlay";
import { type WorkflowPanelRef } from "components/WorkflowPanel";
import React, { useCallback, useMemo, useState } from "react";
import { generateTaskName } from "utils";

import { CustomTabMenu, CustomTabPanel } from "./CustomTabMenu";
import { TaskDetails } from "./CustomTabMenu/TaskDetail";

import { type IWorkflowRunTaskExtended } from ".";

interface Props {
  runId: string | null;
  nodeId: string | null;
  tasks: IWorkflowRunTaskExtended[] | null;
  panelRef: React.RefObject<WorkflowPanelRef>;
}

export const WorkflowRunDetail: React.FC<Props> = ({
  runId,
  nodeId,
  tasks,
}) => {
  const [value, setValue] = useState(0);

  const taskData = useMemo(() => {
    if (nodeId) {
      const task = tasks?.find((task) => {
        const taskName = generateTaskName(task.pieceName, nodeId);
        return task.task_id === taskName;
      });

      console.log(task);
      return task;
    }
  }, [nodeId, tasks]);

  const handleChange = useCallback(
    (_event: React.SyntheticEvent, newValue: number) => {
      setValue(newValue);
    },
    [],
  );

  return (
    <Paper sx={{ height: "80vh" }}>
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
                  Selected task {taskData.task_id}
                </CustomTabPanel>
                <CustomTabPanel index={2} value={value}>
                  Selected task {taskData.task_id}
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
            Select one piece
          </CustomTabMenu>
        )
      ) : (
        <NoDataOverlay />
      )}
    </Paper>
  );
};
