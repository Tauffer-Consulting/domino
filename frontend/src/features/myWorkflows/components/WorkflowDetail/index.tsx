import { Grid, Paper } from "@mui/material";
import { AxiosError } from "axios";
import { Breadcrumbs } from "components/Breadcrumbs";
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
} from "features/myWorkflows/api";
import {
  type IWorkflowRuns,
  type IWorkflowRunTasks,
} from "features/myWorkflows/types";
import React, { useCallback, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { type NodeMouseHandler } from "reactflow";
import { useInterval } from "utils";

import { WorkflowRunDetail } from "./WorkflowRunDetail";
import { WorkflowRunsTable } from "./WorkflowRunsTable";

/**
 * @todo Cancel run. []
 * @todo Pause run. []
 * @todo Show piece logs [ ]
 * @todo Show result [ ]
 * @todo add break interval when workflow is not running
 */

export interface IWorkflowRunTaskExtended extends IWorkflowRunTasks {
  pieceName: string;
}

export const WorkflowDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const workflowPanelRef = useRef<WorkflowPanelRef>(null);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedRun, setSelectedRun] = useState<IWorkflowRuns | null>(null);
  const [tasks, setTasks] = useState<IWorkflowRunTaskExtended[]>([]);

  const { data: workflow } = useAuthenticatedGetWorkflowId({
    id: id as string,
  });

  const fetchWorkflowTasks = useAuthenticatedGetWorkflowRunTasks();
  const handleRunWorkflow = useAuthenticatedPostWorkflowRunId();

  const handleFetchWorkflowRunTasks = useCallback(async () => {
    if (selectedRun && workflow) {
      try {
        const pageSize = 100;
        const result = await fetchWorkflowTasks({
          workflowId: id as string,
          runId: selectedRun.workflow_run_id,
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
                runId: selectedRun.workflow_run_id,
                page,
                pageSize,
              }),
          );
          const responses = await Promise.all(promises);
          allTasks.push(...responses);
        }

        const nodes: RunNode[] = [];
        const tasks: IWorkflowRunTaskExtended[] = [];
        for (const result of allTasks) {
          const { data } = result;

          if (Array.isArray(data)) {
            const nodesData = data
              .map((task) => {
                const defaultNode: DefaultNode | undefined = workflow.ui_schema
                  .nodes[task.task_id] as DefaultNode | undefined;
                const runNode = { ...defaultNode } as unknown as RunNode;

                if (runNode?.data) {
                  runNode.data.taskId = task.task_id;
                  runNode.data.state = task.state;
                }
                return runNode as unknown as RunNode;
              })
              .filter((n) => !!n);
            const tasksData = data
              .map((task) => {
                const node: DefaultNode | undefined = workflow.ui_schema.nodes[
                  task.task_id
                ] as DefaultNode | undefined;

                const pieceName = node?.data?.style?.label ?? node?.data?.name;
                return {
                  ...task,
                  pieceName,
                } as unknown as IWorkflowRunTaskExtended;
              })
              .filter((n) => !!n);
            tasks.push(...tasksData);
            nodes.push(...nodesData);
          }
        }
        const currentNodes = JSON.stringify(
          workflowPanelRef.current?.nodes ?? {},
        );
        const newNodes = JSON.stringify(nodes);
        if (newNodes !== currentNodes) {
          // need to create a different object to perform a re-render
          workflowPanelRef.current?.setNodes(JSON.parse(newNodes));
          workflowPanelRef.current?.setEdges(workflow.ui_schema.edges);
          setTasks(tasks);
          if (
            selectedRun &&
            (selectedRun.state === "success" || selectedRun.state === "failed")
          ) {
            setAutoUpdate(false);
          } else {
            setAutoUpdate(true);
          }
        }
      } catch (e) {
        if (e instanceof AxiosError) {
          console.log(e);
        }
        console.log(e);
      }
    }
  }, [workflow, fetchWorkflowTasks, autoUpdate, selectedRun]);

  const handleSelectRun = useCallback(
    async (run: IWorkflowRuns | null) => {
      // if (!(run?.state === "success") && !(run?.state === "failed")) {
      //   setAutoUpdate(true);
      // }
      // TODO force run without first delay
      setSelectedRun(run);
      setAutoUpdate(true);
    },
    [handleFetchWorkflowRunTasks],
  );

  const onNodeDoubleClick = useCallback<NodeMouseHandler>(
    (_, node: RunNode) => {
      setSelectedNodeId(node.data.taskId);
    },
    [],
  );

  useInterval(handleFetchWorkflowRunTasks, 1000, autoUpdate);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Breadcrumbs />
      </Grid>
      <Grid item xs={12}>
        <WorkflowRunsTable
          triggerRun={() => {
            if (workflow?.id) {
              void handleRunWorkflow({ id: String(workflow.id) });
            }
          }}
          selectedRun={selectedRun}
          onSelectedRunChange={handleSelectRun}
          workflowId={id as string}
          autoUpdate={autoUpdate}
          setAutoUpdate={setAutoUpdate}
        />
      </Grid>
      <Grid item xs={7}>
        <Paper sx={{ height: "46vh" }}>
          <WorkflowPanel
            ref={workflowPanelRef}
            editable={false}
            onNodeDoubleClick={onNodeDoubleClick}
          />
        </Paper>
      </Grid>
      <Grid item xs={5}>
        <WorkflowRunDetail
          runId={selectedRun?.workflow_run_id ?? null}
          tasks={tasks}
          nodeId={selectedNodeId}
          workflowId={id as string}
          autoUpdate={autoUpdate}
        />
      </Grid>
    </Grid>
  );
};
