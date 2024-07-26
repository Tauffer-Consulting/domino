import { useWorkspaces } from "@context/workspaces";
import { useStartRuns } from "@features/myWorkflows/api/runs/useStartRuns";
import { useStopRuns } from "@features/myWorkflows/api/runs/useStopRuns";
import { useDeleteWorkflows } from "@features/myWorkflows/api/workflow/useDeleteWorkflows";
import { InfoOutlined, PlayCircleOutlined } from "@mui/icons-material";
import { IconButton, Paper, Tooltip, useTheme } from "@mui/material";
import {
  DataGrid,
  type GridRowParams,
  type GridColDef,
  type GridEventListener,
  type GridRowSelectionModel,
} from "@mui/x-data-grid";
import { useQueryClient } from "@tanstack/react-query";
import { NoDataOverlay } from "components/NoDataOverlay";
import { useWorkflows, useStartRun } from "features/myWorkflows/api";
import {
  type IBatchWorkflowActionDetail,
  type IWorkflow,
} from "features/myWorkflows/types";
import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { Actions } from "./Actions";
import { FailureDetailsModal } from "./FailureDetailsModal";
import { RunState } from "./RunState";
import { Status } from "./Status";
import { WorkflowsListSkeleton } from "./WorkflowsListSkeleton";

/**
 * TODO Cancel run. []
 * TODO Pause run. []
 */

export const WorkflowList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = React.useState({
    pageSize: 10,
    page: 0,
  });

  const [failureDetails, setFailureDetails] = React.useState<
    IBatchWorkflowActionDetail[]
  >([]);

  const [failureModalOpen, setFailureModalOpen] = React.useState(false);
  const [selectedWorkflowIds, setSelectedWorkflowIds] = React.useState<
    Array<IWorkflow["id"]>
  >([]);

  const { workspace } = useWorkspaces();
  const queryClient = useQueryClient();

  const {
    data: workflows,
    isLoading,
    refetch: handleRefreshWorkflows,
  } = useWorkflows(
    {
      workspaceId: workspace?.id,
      page: paginationModel.page,
      pageSize: paginationModel.pageSize,
    },
    {
      refetchInterval: 1500,
    },
  );

  const { mutateAsync: handleDeleteWorkflows } = useDeleteWorkflows(
    {
      workspaceId: workspace?.id,
    },
    {
      onSuccess: async (response, { workflowIds }) => {
        await queryClient.invalidateQueries({
          queryKey: ["WORKFLOWS", workspace?.id, workflowIds],
        });
        if (response.result === "success") {
          toast.success("Workflows deleted");
        } else {
          setFailureDetails(response.details);
          toast.warning(
            <div
              onClick={() => {
                setFailureModalOpen(true);
              }}
              style={{ textDecoration: "underline" }}
            >
              Some workflows couldn't be deleted.
            </div>,
          );
        }
      },
    },
  );

  const { mutateAsync: handleRunWorkflows } = useStartRuns(
    {
      workspaceId: workspace?.id,
    },
    {
      onSuccess: async (response, { workflowIds }) => {
        await queryClient.invalidateQueries({
          queryKey: ["RUNS", workspace?.id, workflowIds],
        });
        if (response.result === "success") {
          toast.success("Workflows started to run");
        } else {
          setFailureDetails(response.details);
          toast.warning(
            <div
              onClick={() => {
                setFailureModalOpen(true);
              }}
              style={{ textDecoration: "underline" }}
            >
              Some workflows couldn't be started.
            </div>,
          );
        }
      },
    },
  );

  const { mutateAsync: handleStopWorkflows } = useStopRuns(
    {
      workspaceId: workspace?.id,
    },
    {
      onSuccess: async (response, { workflowIds }) => {
        await queryClient.invalidateQueries({
          queryKey: ["RUNS", workspace?.id, workflowIds],
        });
        if (response.result === "success") {
          toast.success("Workflows stopped");
        } else {
          setFailureDetails(response.details);
          toast.warning(
            <div
              onClick={() => {
                setFailureModalOpen(true);
              }}
              style={{ textDecoration: "underline" }}
            >
              Some workflows couldn't be stopped.
            </div>,
          );
        }
      },
    },
  );

  const { mutateAsync: handleRunWorkflow } = useStartRun(
    {
      workspaceId: workspace?.id,
    },
    {
      onSuccess: async (_, { workflowId }) => {
        await queryClient.invalidateQueries({
          queryKey: ["RUNS", workspace?.id, workflowId],
        });
        toast.success("Workflow run started");
      },
    },
  );

  const runWorkflow = useCallback(async (id: IWorkflow["id"]) => {
    try {
      await handleRunWorkflow({ workflowId: String(id) });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const runWorkflows = useCallback(async (ids: Array<IWorkflow["id"]>) => {
    try {
      await handleRunWorkflows({ workflowIds: ids });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const deleteWorkflows = useCallback(async (ids: Array<IWorkflow["id"]>) => {
    try {
      await handleDeleteWorkflows({ workflowIds: ids });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const stopWorkflows = useCallback(async (ids: Array<IWorkflow["id"]>) => {
    try {
      await handleStopWorkflows({ workflowIds: ids });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const { rows, totalRows } = useMemo(
    () => ({
      rows: workflows?.data ?? [],
      totalRows: workflows?.metadata?.total ?? 0,
    }),
    [workflows],
  );

  const columns = useMemo<Array<GridColDef<IWorkflow>>>(
    () => [
      {
        field: "id",
        headerName: "ID",
        width: 60,
        headerAlign: "left",
        align: "left",
        sortable: false,
        minWidth: 50,
      },
      {
        field: "state",
        headerName: "Last Run State",
        headerAlign: "left",
        align: "left",
        type: "string",
        minWidth: 150,
        // flex: 1,
        renderCell: (params) => {
          return <RunState state={params.row.last_run_status} />;
        },
      },
      {
        field: "status",
        headerName: "Status",
        renderCell: (params) => <Status status={params.row.status} />,
        flex: 0.5,
        align: "left",
        headerAlign: "left",
        sortable: false,
        minWidth: 100,
      },
      { field: "name", headerName: "Workflow Name", flex: 2, minWidth: 180 },
      {
        field: "start_date",
        renderHeader: () => (
          <Tooltip title="Start date is the date when your workflow begins scheduling. Workflows cannot be run before this start date">
            <span style={{ display: "flex", alignItems: "center" }}>
              Start Date{" "}
              <InfoOutlined style={{ marginLeft: "5px" }} fontSize="small" />
            </span>
          </Tooltip>
        ),
        flex: 1,
        align: "left",
        minWidth: 180,

        valueFormatter: ({ value }) => new Date(value).toLocaleString(),
        headerAlign: "left",
      },
      {
        field: "end_date",
        renderHeader: () => (
          <Tooltip title="End Date is the date when your workflow stop to be scheduled. You cannot run workflows after end date.">
            <span style={{ display: "flex", alignItems: "center" }}>
              End Date{" "}
              <InfoOutlined style={{ marginLeft: "5px" }} fontSize="small" />
            </span>
          </Tooltip>
        ),
        headerAlign: "left",
        align: "left",
        type: "string",
        flex: 1,
        minWidth: 180,
        valueFormatter: ({ value }) =>
          value ? new Date(value).toLocaleString() : "None",
      },
      {
        field: "created_at",
        headerName: "Created At",
        flex: 1,
        align: "left",
        minWidth: 180,
        valueFormatter: ({ value }) => new Date(value).toLocaleString(),
        headerAlign: "left",
      },
      {
        field: "last_changed_at",
        headerName: "Last Modified",
        flex: 1,
        align: "left",
        valueFormatter: ({ value }) => new Date(value).toLocaleString(),
        headerAlign: "left",
        minWidth: 180,
      },
      {
        field: "schedule",
        headerName: "Schedule",
        flex: 1,
        align: "left",
        headerAlign: "left",
        sortable: false,
        minWidth: 100,
      },
      {
        field: "next_dagrun",
        headerName: "Next Run",
        flex: 1,
        align: "left",
        headerAlign: "left",
        minWidth: 180,
        sortable: false,
        valueFormatter: ({ value }) =>
          value ? new Date(value).toLocaleString() : "none",
      },
      {
        field: "run",
        headerName: "Run",
        renderCell: ({ row }) => {
          return (
            <>
              {new Date(row.start_date) > new Date() ? (
                <Tooltip title="Can't run future workflows." arrow>
                  <span>
                    <IconButton
                      className=".action-button"
                      onClick={() => {
                        void runWorkflow(row.id);
                      }}
                    >
                      <PlayCircleOutlined
                        style={{
                          pointerEvents: "none",
                          color: theme.palette.grey[500],
                        }}
                      />
                    </IconButton>
                  </span>
                </Tooltip>
              ) : (
                <IconButton
                  className=".action-button"
                  onClick={() => {
                    void runWorkflow(row.id);
                  }}
                >
                  <PlayCircleOutlined
                    style={{
                      pointerEvents: "none",
                      color: theme.palette.success.main,
                    }}
                  />
                </IconButton>
              )}
            </>
          );
        },
        headerAlign: "left",
        align: "left",
        sortable: false,
        minWidth: 50,
      },
    ],
    [],
  );

  const handleRowClick = useCallback<GridEventListener<"rowClick">>(
    (params: GridRowParams<IWorkflow>, event) => {
      const isActionButtonClick =
        event.target instanceof Element &&
        event.target.classList.contains(".action-button");
      if (!isActionButtonClick) {
        if (new Date(params.row.start_date) > new Date()) {
          toast.warning(
            "Future workflows runs cannot be accessed. Wait until the start date.",
          );
          return;
        }
        if (params.row.status !== "failed" && params.row.status !== "creating")
          navigate(`/my-workflows/${params.id}`);
      }
    },
    [navigate],
  );

  const handleSelectionModelChange = (newSelection: GridRowSelectionModel) => {
    setSelectedWorkflowIds(newSelection as number[]);
  };

  if (isLoading) {
    return <WorkflowsListSkeleton />;
  }

  return (
    <>
      <Paper sx={{ height: "80vh" }}>
        <DataGrid
          density="compact"
          columns={columns}
          checkboxSelection
          rows={rows}
          isRowSelectable={(params) =>
            params.row.status !== "failed" && params.row.status !== "creating"
          }
          onRowClick={handleRowClick}
          pagination
          paginationMode="server"
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: {
              paginationModel,
            },
          }}
          rowCount={totalRows}
          onPaginationModelChange={setPaginationModel}
          onRowSelectionModelChange={handleSelectionModelChange}
          disableDensitySelector
          disableRowSelectionOnClick
          hideFooterSelectedRowCount
          disableColumnMenu
          disableColumnSelector
          slots={{
            noRowsOverlay: NoDataOverlay,
            toolbar: () => {
              return (
                <Actions
                  ids={selectedWorkflowIds}
                  runFn={() => {
                    void runWorkflows(selectedWorkflowIds);
                  }}
                  stopFn={() => {
                    void stopWorkflows(selectedWorkflowIds);
                  }}
                  deleteFn={() => {
                    void deleteWorkflows(selectedWorkflowIds);
                  }}
                  disabled={selectedWorkflowIds.length === 0}
                />
              );
            },
          }}
          sx={{
            // disable cell selection style
            "&.MuiDataGrid-root .MuiDataGrid-cell:focus": {
              outline: "none",
            },
            // pointer cursor on ALL rows
            "& .MuiDataGrid-row:hover": {
              cursor: "pointer",
            },
          }}
        />
      </Paper>
      <FailureDetailsModal
        isOpen={failureModalOpen}
        title={"Workflow Runs Failure Details"}
        data={failureDetails}
        cancelCb={() => {
          setFailureModalOpen(false);
        }}
      />
    </>
  );
};
