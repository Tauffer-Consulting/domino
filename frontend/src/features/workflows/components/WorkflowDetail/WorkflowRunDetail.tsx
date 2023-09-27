import { Paper } from "@mui/material";
import { NoDataOverlay } from "components/NoDataOverlay";
import { type WorkflowPanelRef } from "components/WorkflowPanel";
import React from "react";
import { type Node } from "reactflow";

interface Props {
  runId: string | null;
  node: Node | null;
  panelRef: React.RefObject<WorkflowPanelRef>;
}

export const WorkflowRunDetail: React.FC<Props> = ({ runId, node }) => {
  return (
    <Paper sx={{ height: "80vh" }}>
      {runId ? (
        node ? (
          <p style={{ margin: 0 }}>{JSON.stringify(node)}</p>
        ) : (
          <>Selecione um piece</>
        )
      ) : (
        <NoDataOverlay />
      )}
    </Paper>
  );
};
