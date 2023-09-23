import { Grid, Paper } from "@mui/material";
import WorkflowPanel, { type WorkflowPanelRef } from "components/WorkflowPanel";
import { useWorkflows } from "features/workflows/context";
import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { WorkflowDetailSkeleton } from "./skeleton";

/**
 * @todo List Runs []
 * @todo Show selected run (default last one) []
 */

export const WorkflowDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const workflowPanelRef = useRef<WorkflowPanelRef>(null);
  const { selectedWorkflow } = useWorkflows();
  const [loading, _setLoading] = useState(selectedWorkflow?.id !== id);

  if (loading) {
    return <WorkflowDetailSkeleton />;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ height: "40vh" }}>
          <p>RUN DO WORKFLOW = {id}</p>
        </Paper>
      </Grid>
      <Grid item xs={8}>
        <Paper sx={{ height: "80vh" }}>
          <WorkflowPanel
            editable={false}
            ref={workflowPanelRef}
            onNodeDoubleClick={() => {}}
          />
        </Paper>
      </Grid>
      <Grid item xs={4}>
        <Paper sx={{ height: "80vh" }}>
          <p style={{ margin: 0 }}>Workflow run detail</p>
        </Paper>
      </Grid>
    </Grid>
  );
};
