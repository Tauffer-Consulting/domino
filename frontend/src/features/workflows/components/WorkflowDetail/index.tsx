import { Grid, Paper } from "@mui/material";
import WorkflowPanel, { type WorkflowPanelRef } from "components/WorkflowPanel";
import React, { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { type Node } from "reactflow";

import { WorkflowRunDetail } from "./WorkflowRunDetail";
import { WorkflowRunsTable } from "./WorkflowRunsTable";

/**
 * @todo List Runs []
 * @todo Show selected run (default last one) []
 */

export const WorkflowDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const workflowPanelRef = useRef<WorkflowPanelRef>(null);
  const [selectedRunId] = useState<number | null>(null);
  const [selectedNode] = useState<Node | null>(null);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <WorkflowRunsTable workflowId={id as string} />
      </Grid>
      <Grid item xs={7}>
        <Paper sx={{ height: "80vh" }}>
          <WorkflowPanel
            ref={workflowPanelRef}
            editable={false}
            onNodeDoubleClick={() => {}}
          />
        </Paper>
      </Grid>
      <Grid item xs={5}>
        <WorkflowRunDetail
          runId={selectedRunId}
          node={selectedNode}
          panelRef={workflowPanelRef}
        />
      </Grid>
    </Grid>
  );
};
