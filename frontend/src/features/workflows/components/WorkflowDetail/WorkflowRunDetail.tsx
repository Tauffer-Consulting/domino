import { Paper } from "@mui/material";
import { NoDataOverlay } from "components/NoDataOverlay";
import { type WorkflowPanelRef } from "components/WorkflowPanel";
import React from "react";

interface Props {
  runId: string | null;
  nodeId: string | null;
  panelRef: React.RefObject<WorkflowPanelRef>;
}

export const WorkflowRunDetail: React.FC<Props> = ({ runId, nodeId }) => {
  return (
    <Paper sx={{ height: "80vh" }}>
      {runId ? (
        nodeId ? (
          <p style={{ margin: 0 }}>{nodeId}</p>
        ) : (
          <>Selecione um piece</>
        )
      ) : (
        <NoDataOverlay />
      )}
    </Paper>
  );
};
