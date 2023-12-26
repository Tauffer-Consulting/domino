import { Chip, Container, Divider, Grid } from "@mui/material";
import { RenderB64 } from "components/RenderB64";
import { type IWorkflowRunTasks } from "features/myWorkflows/types";
import React from "react";

interface Props {
  id: string;
  taskData: IWorkflowRunTasks & {
    pieceName: string;
    base64_content: string;
    file_type: string;
  };
}

export const PieceReport: React.FC<Props> = ({ taskData, id }) => {
  return (
    <Grid
      id={id}
      container
      item
      xs={4}
      style={{ marginBottom: "10mm", width: "100%" }}
    >
      <Grid item xs={12}>
        <Divider>
          <Chip label={taskData.pieceName} color={taskData.state as any} />
        </Divider>
      </Grid>

      <Grid item xs={12}>
        {/* This is the result (if exists) */}
        <Container>
          <RenderB64
            base64_content={taskData.base64_content}
            file_type={taskData.file_type}
          />
        </Container>
      </Grid>
    </Grid>
  );
};
