import { Grid, Paper } from "@mui/material";
import { AxiosError } from "axios";
import {
  WorkflowPanel,
  type WorkflowPanelRef,
  type RunNode,
  type DefaultNode,
} from "components/WorkflowPanel";
import {
  useAuthenticatedGetWorkflowId,
  useAuthenticatedGetWorkflowRunTasks,
  useAuthenticatedPostWorkflowRunId,
} from "features/workflows/api";
import React, { useCallback, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { type NodeMouseHandler } from "reactflow";
import { useInterval } from "utils";

import { WorkflowRunDetail } from "./WorkflowRunDetail";
import { WorkflowRunsTable } from "./WorkflowRunsTable";

/**
 * @todo Cancel run. []
 * @todo Pause run. []
 */

export const WorkflowDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const workflowPanelRef = useRef<WorkflowPanelRef>(null);
  const [selectedNode, setSelectedNode] = useState<RunNode | null>(null);
  const [runId, setRunId] = useState<string | null>(null);

  const { data: workflow, mutate: refreshWorkflow } =
    useAuthenticatedGetWorkflowId({
      id: id as string,
    });

  const fetchWorkflowTasks = useAuthenticatedGetWorkflowRunTasks();
  const handleRunWorkflow = useAuthenticatedPostWorkflowRunId();

  const handleFetchWorkflowRunTasks = useCallback(async () => {
    if (runId && workflow) {
      try {
        const pageSize = 100;
        const result = await fetchWorkflowTasks({
          workflowId: id as string,
          runId,
          page: 0,
          pageSize,
        });
        const { metadata } = result;
        const total = metadata?.total ? metadata.total : 0;

        const allTasks = [result];

        if (total > pageSize) {
          const numberOfPages = Math.ceil(total / pageSize);
          const pages = Array.from(Array(numberOfPages).keys()).slice(1);
          const promises = pages.map(
            async (page) =>
              await fetchWorkflowTasks({
                workflowId: id as string,
                runId,
                page,
                pageSize,
              }),
          );
          const responses = await Promise.all(promises);
          allTasks.push(...responses);
        }

        const nodes: RunNode[] = [];
        for (const result of allTasks) {
          const { data } = result;
          // Create nodes and edges
          const responseNodesData = Array.isArray(data)
            ? data
                .map((task) => {
                  const defaultNode: DefaultNode | undefined = workflow
                    .ui_schema.nodes[task.task_id] as DefaultNode | undefined;
                  const runNode = { ...defaultNode } as unknown as RunNode;

                  if (runNode?.data) {
                    runNode.data.state = task.state;
                  }
                  return runNode as unknown as RunNode;
                })
                .filter((n) => !!n)
            : [];
          nodes.push(...responseNodesData);
        }
        const currentNodes = JSON.stringify(
          workflowPanelRef.current?.nodes ?? {},
        );
        const newNodes = JSON.stringify(nodes);
        if (newNodes !== currentNodes) {
          console.log("here", nodes);
          console.log("here", workflowPanelRef.current?.nodes);
          workflowPanelRef.current?.setNodes(nodes);
          workflowPanelRef.current?.setEdges(workflow.ui_schema.edges);
        }
      } catch (e) {
        if (e instanceof AxiosError) {
          console.log(e);
        }
        console.log(e);
      }
    }
  }, [runId, workflow, fetchWorkflowTasks]);

  const onNodeDoubleClick = useCallback<NodeMouseHandler>((_, node) => {
    setSelectedNode(node);
  }, []);

  useInterval(handleFetchWorkflowRunTasks, 1000);
  useInterval(refreshWorkflow, 5000);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <WorkflowRunsTable
          triggerRun={() => {
            if (workflow?.id) {
              void handleRunWorkflow({ id: String(workflow.id) });
              void refreshWorkflow();
            }
          }}
          selectedRunId={runId}
          setSelectedRunId={setRunId}
          workflowId={id as string}
        />
      </Grid>
      <Grid item xs={7}>
        <Paper sx={{ height: "80vh" }}>
          <WorkflowPanel
            ref={workflowPanelRef}
            editable={false}
            onNodeDoubleClick={onNodeDoubleClick}
          />
        </Paper>
      </Grid>
      <Grid item xs={5}>
        <WorkflowRunDetail
          runId={runId}
          node={selectedNode}
          panelRef={workflowPanelRef}
        />
      </Grid>
    </Grid>
  );
};
