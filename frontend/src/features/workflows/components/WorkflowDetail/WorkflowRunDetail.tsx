import { Paper } from "@mui/material";
import { NoDataOverlay } from "components/NoDataOverlay";
import { type WorkflowPanelRef } from "components/WorkflowPanel";
import React from "react";
import { type Node } from "reactflow";

interface Props {
  runId: number | null;
  node: Node | null;
  panelRef: React.RefObject<WorkflowPanelRef>;
}

export const WorkflowRunDetail: React.FC<Props> = ({ runId }) => {
  return (
    <Paper sx={{ height: "80vh" }}>
      {runId ? <p>Vai ter dado</p> : <NoDataOverlay />}
    </Paper>
  );
};
