import { useWorkspaces } from "@context/workspaces";
import {
  useWorkflow,
  type IWorkflowRuns,
  type IWorkflowRunTasks,
  useRunTasks,
  useStartRun,
} from "@features/myWorkflows";
import { type DefaultNode } from "@features/workflowEditor/components/Panel/WorkflowPanel";
import { Grid, Paper } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { Breadcrumbs } from "components/Breadcrumbs";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { type NodeMouseHandler } from "reactflow";

import {
  WorkflowPanel,
  type WorkflowPanelRef,
  type RunNode,
} from "./WorkflowPanel";
import { WorkflowRunDetail } from "./WorkflowRunDetail";
import { WorkflowRunsTable } from "./WorkflowRunsTable";

/**
 * TODO Cancel run. []
 * TODO Pause run. []
 * TODO add break interval when workflow is not running
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

  const { workspace } = useWorkspaces();
  const queryClient = useQueryClient();

  const workflowPanelRef = useRef<WorkflowPanelRef>(null);

  const { data: workflow } = useWorkflow({
    workspaceId: workspace?.id,
    workflowId: id!,
  });

  const {
    data: allTasks,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useRunTasks(
    {
      workspaceId: workspace?.id,
      workflowId: id!,
      runId: selectedRun?.workflow_run_id,
    },
    {
      refetchInterval: () => (autoUpdate ? 1500 : false),
    },
  );

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const { mutateAsync: handleRunWorkflow } = useStartRun(
    {
      workspaceId: workspace?.id,
    },
    {
      onSuccess: async (_, { workflowId }) => {
        await queryClient.invalidateQueries({
          queryKey: ["RUNS", workspace?.id, workflowId],
        });
        setAutoUpdate(true);
        toast.success("Workflow run started");
      },
    },
  );

  const { nodes, edges, tasks } = useMemo(() => {
    const edges = workflow?.ui_schema.edges ?? [];
    console.log(workflow?.ui_schema.nodes);
    const nodes: RunNode[] = [];
    const tasks: IWorkflowRunTaskExtended[] = [];
    if (selectedRun && workflow && allTasks?.pages) {
      for (const result of allTasks.pages ?? []) {
        const { data } = result;

        if (Array.isArray(data)) {
          const nodesData = data
            .map((task) => {
              const defaultNode: DefaultNode | undefined =
                workflow.ui_schema.nodes[task.task_id];
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
              const node: DefaultNode | undefined =
                workflow.ui_schema.nodes[task.task_id];

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
    } else if (workflow) {
      const uiNodes = Object.values(workflow.ui_schema.nodes);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      uiNodes.forEach((n) => nodes.push(n));
    }
    return { nodes, edges, tasks };
  }, [allTasks, workflow]);

  const triggerRun = useCallback(async () => {
    if (workflow?.id) {
      await handleRunWorkflow({ workflowId: String(workflow.id) });
      setSelectedRun(null);
    }
  }, [workflow, handleRunWorkflow, setSelectedRun]);

  useEffect(() => {
    workflowPanelRef.current?.setNodes(nodes);
    workflowPanelRef.current?.setEdges(edges);
    setTasks(tasks);
  }, [nodes, edges, tasks]);

  useEffect(() => {
    if (
      selectedRun &&
      (selectedRun.state === "success" || selectedRun.state === "failed")
    ) {
      setTimeout(() => {
        setAutoUpdate(false);
      }, 3000);
    } else {
      setAutoUpdate(true);
    }
  }, [selectedRun, setAutoUpdate]);

  const handleSelectRun = useCallback((run: IWorkflowRuns | null) => {
    setSelectedRun(run);
    setAutoUpdate(true);
  }, []);

  const onNodeDoubleClick = useCallback<NodeMouseHandler>(
    (_, node: RunNode) => {
      setSelectedNodeId(node.data.taskId);
    },
    [],
  );

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
              autoUpdate={autoUpdate}
              triggerRun={triggerRun}
              selectedRun={selectedRun}
              onSelectedRunChange={handleSelectRun}
              workflowId={id!}
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
            autoUpdate={autoUpdate}
            runId={selectedRun?.workflow_run_id}
            tasks={statusTasks}
            nodeId={selectedNodeId}
            workflowId={id}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};
