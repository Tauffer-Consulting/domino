import { Grid } from "@mui/material";
import { RenderB64 } from "components/RenderB64";
import { type IWorkflowRunTasks } from "features/myWorkflows/types";
import React from "react";

import { TaskDetails } from "../WorkflowDetail/CustomTabMenu/TaskDetail";

interface Props {
  taskData: IWorkflowRunTasks & {
    pieceName: string;
    base64_content: string;
    file_type: string;
  };
}

export const PieceReport: React.FC<Props> = ({ taskData }) => {
  return (
    <Grid container item xs={6} style={{ marginBottom: "10mm", width: "100%" }}>
      <Grid item xs={5}>
        {/* this is the infos about the piece  */}
        <TaskDetails taskData={taskData} />
      </Grid>
      <Grid item xs={7}>
        {/* This is the result (if exists) */}
        <RenderB64
          base64_content={taskData.base64_content}
          file_type={taskData.file_type}
        />
      </Grid>
    </Grid>
  );
};
