import { useWorkspaces } from "@context/workspaces";
import { InfoOutlined } from "@mui/icons-material";
import { Paper, Tooltip } from "@mui/material";
import {
  DataGrid,
  type GridRowParams,
  type GridColDef,
  type GridEventListener,
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
import { Status } from "./Status";
import { WorkflowsListSkeleton } from "./WorkflowsListSkeleton";

/**
 * @todo Cancel run. []
 * @todo Pause run. []
 */

export const WorkflowList: React.FC = () => {
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = React.useState({
    pageSize: 10,
    page: 0,
  });

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
        toast.info("Workflow deleted");
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
        toast.info("Workflow run started");
      },
    },
  );

  const deleteWorkflow = useCallback(async (id: IWorkflow["id"]) => {
    try {
      await handleDeleteWorkflow({ workflowId: String(id) });
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
        headerAlign: "center",
        align: "center",
        sortable: false,
      },
      {
        field: "status",
        headerName: "Status",
        renderCell: (params) => <Status status={params.row.status} />,
        flex: 0.5,
        align: "center",
        headerAlign: "center",
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
        align: "center",
        minWidth: 220,

        valueFormatter: ({ value }) => new Date(value).toLocaleString(),
        headerAlign: "center",
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
        headerAlign: "center",
        align: "center",
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
        align: "center",
        minWidth: 220,

        valueFormatter: ({ value }) => new Date(value).toLocaleString(),
        headerAlign: "center",
      },
      {
        field: "last_changed_at",
        headerName: "Last Modified",
        flex: 1,
        align: "center",
        valueFormatter: ({ value }) => new Date(value).toLocaleString(),
        headerAlign: "center",
        minWidth: 220,
      },
      {
        field: "schedule",
        headerName: "Schedule",
        flex: 1,
        align: "center",
        headerAlign: "center",
        sortable: false,
        minWidth: 100,
      },
      {
        field: "next_dagrun",
        headerName: "Next Run",
        flex: 1,
        align: "center",
        headerAlign: "center",
        minWidth: 220,
        sortable: false,
        valueFormatter: ({ value }) =>
          value ? new Date(value).toLocaleString() : "none",
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 1,
        renderCell: ({ row }) => {
          return (
            <Actions
              id={row.id}
              className=".action-button"
              deleteFn={() => {
                void deleteWorkflow(row.id);
              }}
              runFn={() => {
                void runWorkflow(row.id);
              }}
              pauseFn={() => {
                pauseWorkflow(row.id);
              }}
              disabled={new Date(row.start_date) > new Date()}
            />
          );
        },
        headerAlign: "center",
        align: "center",
        sortable: false,
        minWidth: 150,
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

  if (isLoading) {
    return <WorkflowsListSkeleton />;
  }

  return (
    <>
      <Paper sx={{ height: "80vh" }}>
        <DataGrid
          density="comfortable"
          columns={columns}
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
          disableDensitySelector
          disableRowSelectionOnClick
          hideFooterSelectedRowCount
          disableColumnMenu
          disableColumnSelector
          slots={{ noRowsOverlay: NoDataOverlay }}
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
