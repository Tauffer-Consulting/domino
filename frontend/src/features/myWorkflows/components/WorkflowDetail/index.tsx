import { Grid, Paper } from "@mui/material";
import { Breadcrumbs } from "components/Breadcrumbs";
import {
  useAuthenticatedGetWorkflowId,
  useAuthenticatedGetWorkflowRunTasks,
  useAuthenticatedPostWorkflowRunId,
} from "features/myWorkflows/api";
import {
  type IWorkflowRuns,
  type IWorkflowRunTasks,
} from "features/myWorkflows/types";
import { type DefaultNode } from "features/workflowEditor/components/Panel/WorkflowPanel";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { type NodeMouseHandler } from "reactflow";
import { useInterval } from "utils";

import {
  WorkflowPanel,
  type WorkflowPanelRef,
  type RunNode,
} from "./WorkflowPanel";
import {
  WorkflowRunDetail,
  type WorkflowRunDetailRef,
} from "./WorkflowRunDetail";
import {
  WorkflowRunsTable,
  type WorkflowRunsTableRef,
} from "./WorkflowRunsTable";

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
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [selectedRun, setSelectedRun] = useState<IWorkflowRuns | null>(null);
  const [statusTasks, setTasks] = useState<IWorkflowRunTaskExtended[]>([]);

  const workflowPanelRef = useRef<WorkflowPanelRef>(null);
  const workflowRunsTableRef = useRef<WorkflowRunsTableRef>(null);
  const workflowRunDetailRef = useRef<WorkflowRunDetailRef>(null);

  const { data: workflow } = useAuthenticatedGetWorkflowId({
    id: id as string,
  });

  const fetchWorkflowTasks = useAuthenticatedGetWorkflowRunTasks();
  const handleRunWorkflow = useAuthenticatedPostWorkflowRunId();

  const triggerRun = () => {
    if (workflow?.id) {
      void handleRunWorkflow({ id: String(workflow.id) });
      setInterval(() => {
        setAutoUpdate(true);
      }, 1500);
    }
  };

  const refreshDetails = useCallback(() => {
    void workflowRunDetailRef.current?.refreshTaskLogs();
    void workflowRunDetailRef.current?.refreshTaskResults();
  }, [workflowRunDetailRef]);

  const refreshTable = useCallback(() => {
    void workflowRunsTableRef.current?.refetchWorkflowsRun();
  }, [workflowRunsTableRef]);

  const refreshTasks = useCallback(async () => {
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
        const currentTaks = JSON.stringify(statusTasks);
        const newTasks = JSON.stringify(tasks);

        if (currentTaks !== newTasks) {
          setTasks(tasks);
        }

        const currentNodes = JSON.stringify(
          workflowPanelRef.current?.nodes ?? {},
        );
        const newNodes = JSON.stringify(nodes);
        if (newNodes !== currentNodes) {
          // need to create a different object to perform a re-render
          workflowPanelRef.current?.setNodes(JSON.parse(newNodes));
          workflowPanelRef.current?.setEdges(workflow.ui_schema.edges);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }, [workflow, fetchWorkflowTasks, selectedRun]);

  const refresh = useCallback(async () => {
    refreshDetails();
    refreshTable();
    await refreshTasks();

    if (
      selectedRun &&
      (selectedRun.state === "success" || selectedRun.state === "failed")
    ) {
      setAutoUpdate(false);
    } else {
      setAutoUpdate(true);
    }
  }, [refreshDetails, refreshTable, refreshTasks, selectedRun, setAutoUpdate]);

  const handleSelectRun = useCallback(
    (run: IWorkflowRuns | null) => {
      setSelectedRun(run);
      setAutoUpdate(true);
    },
    [refreshDetails, refreshTable, refreshTasks],
  );

  const onNodeDoubleClick = useCallback<NodeMouseHandler>(
    (_, node: RunNode) => {
      setSelectedNodeId(node.data.taskId);
    },
    [],
  );

  useEffect(() => {
    if (selectedRun) {
      refresh().catch((e) => {
        console.log(e);
      });
    }
  }, [selectedRun, refresh]);

  useInterval(refresh, 3000, autoUpdate);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Breadcrumbs />
      </Grid>
      <Grid item xs={12} container spacing={3}>
        {/* Left Column */}
        <Grid item lg={7} xs={12}>
          {/* WorkflowRunsTable */}
          <Grid item xs={12} sx={{ paddingLeft: "1rem" }}>
            <WorkflowRunsTable
              triggerRun={triggerRun}
              refresh={refresh}
              selectedRun={selectedRun}
              ref={workflowRunsTableRef}
              onSelectedRunChange={handleSelectRun}
              workflowId={id as string}
            />
          </Grid>
          {/* WorkflowPanel */}
          <Grid item xs={12} sx={{ paddingLeft: "1rem", paddingTop: "2vh" }}>
            <Paper sx={{ height: "44vh" }}>
              <WorkflowPanel
                ref={workflowPanelRef}
                onNodeDoubleClick={onNodeDoubleClick}
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Right Column */}
        <Grid item lg={5} xs={12}>
          <WorkflowRunDetail
            ref={workflowRunDetailRef}
            runId={selectedRun?.workflow_run_id}
            tasks={statusTasks}
            nodeId={selectedNodeId}
            workflowId={id as string}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};
