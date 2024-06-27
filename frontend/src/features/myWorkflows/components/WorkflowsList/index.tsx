import { useWorkspaces } from "@context/workspaces";
import { InfoOutlined } from "@mui/icons-material";
import { Paper, Tooltip } from "@mui/material";
import {
  DataGrid,
  type GridRowParams,
  type GridColDef,
  type GridEventListener,
  type GridRowSelectionModel,
} from "@mui/x-data-grid";
import { useQueryClient } from "@tanstack/react-query";
import { NoDataOverlay } from "components/NoDataOverlay";
import {
  useDeleteWorkflow,
  useWorkflows,
  useStartRun,
} from "features/myWorkflows/api";
import { type IWorkflow } from "features/myWorkflows/types";
import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { Actions } from "./Actions";
import { RunState } from "./RunState";
import { Status } from "./Status";
import { WorkflowsListSkeleton } from "./WorkflowsListSkeleton";

/**
 * TODO Cancel run. []
 * TODO Pause run. []
 */

export const WorkflowList: React.FC = () => {
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = React.useState({
    pageSize: 10,
    page: 0,
  });

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
      refetchInterval: 5000,
    },
  );

  const { mutateAsync: handleDeleteWorkflow } = useDeleteWorkflow(
    {
      workspaceId: workspace?.id,
    },
    {
      onSuccess: () => {
        toast.success("Workflow deleted");
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

  const deleteWorkflows = useCallback(async (ids: Array<IWorkflow["id"]>) => {
    try {
      for (const id of ids) {
        await handleDeleteWorkflow({ workflowId: String(id) });
      }
      await handleRefreshWorkflows();
    } catch (e) {
      console.error(e);
    }
  }, []);

  const runWorkflow = useCallback(async (id: IWorkflow["id"]) => {
    try {
      await handleRunWorkflow({ workflowId: String(id) });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const runWorkflows = useCallback(async (ids: Array<IWorkflow["id"]>) => {
    try {
      for (const id of ids) {
        await handleRunWorkflow({ workflowId: String(id) });
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const pauseWorkflow = useCallback((_id: IWorkflow["id"]) => {}, []);

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
        width: 80,
        headerAlign: "left",
        align: "left",
        sortable: false,
        minWidth: 100,
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
      { field: "name", headerName: "Workflow Name", flex: 2, minWidth: 220 },
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
        minWidth: 220,

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
        minWidth: 220,
        valueFormatter: ({ value }) =>
          value ? new Date(value).toLocaleString() : "None",
      },
      {
        field: "created_at",
        headerName: "Created At",
        flex: 1,
        align: "left",
        minWidth: 220,
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
        minWidth: 220,
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
        minWidth: 220,
        sortable: false,
        valueFormatter: ({ value }) =>
          value ? new Date(value).toLocaleString() : "none",
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
    </>
  );
};
