import { Paper } from "@mui/material";
import {
  DataGrid,
  type GridColumns,
  type GridEventListener,
} from "@mui/x-data-grid";
import { AxiosError } from "axios";
import { useWorkflows } from "features/workflows/context";
import { type IWorkflow } from "features/workflows/types";
import React, { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Actions from "./Actions";
import { Status } from "./Status";

/**
 * @todo Trigger run. [x]
 * @todo Delete workflow. [x]
 * @todo Cancel run. []
 * @todo Pause run. []
 */

export const WorkflowList: React.FC = () => {
  const {
    workflows,
    tablePage,
    setTablePage,
    handleRunWorkflow,
    handleDeleteWorkflow,
    handleRefreshWorkflows,
  } = useWorkflows();
  const navigate = useNavigate();

  const deleteWorkflow = useCallback(async (id: IWorkflow["id"]) => {
    try {
      await handleDeleteWorkflow(String(id));
      handleRefreshWorkflows();
      toast.success("Workflow deleted.");
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e?.response?.status === 403) {
          toast.error("You are not allowed to delete this workflow.");
        } else if (e?.response?.status === 404) {
          toast.error("Workflow not found.");
        } else if (e?.response?.status === 409) {
          toast.error("Workflow is not in a valid state. ");
        } else {
          console.error(e);
          toast.error("Something went wrong.");
        }
      } else {
        console.error(e);
      }
    }
  }, []);
  const runWorkflow = useCallback(async (id: IWorkflow["id"]) => {
    try {
      await handleRunWorkflow(String(id));
      toast.info("Workflow started");
    } catch (e) {
      if (e instanceof AxiosError) {
        if (e?.response?.status === 403) {
          toast.error("You are not allowed to run this workflow.");
        } else if (e?.response?.status === 404) {
          toast.error("Workflow not found.");
        } else if (e?.response?.status === 409) {
          toast.error("Workflow is not in a valid state. ");
        } else {
          console.error(e);
          toast.error("Something went wrong when starting the workflow.");
        }
      } else {
        console.error(e);
      }
    }
  }, []);
  const pauseWorkflow = useCallback((id: IWorkflow["id"]) => {
    console.log(id);
  }, []);

  const { rows, totalRows } = useMemo(
    () => ({
      rows: workflows.data ?? [],
      totalRows: workflows.metadata?.total ?? 0,
    }),
    [workflows],
  );

  const columns = useMemo<GridColumns<IWorkflow>>(
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
      },
      { field: "name", headerName: "Workflow Name", flex: 2 },
      {
        field: "created_at",
        headerName: "Created At",
        flex: 1,
        align: "center",

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
      },
      {
        field: "schedule_interval",
        headerName: "Schedule Interval",
        flex: 1,
        align: "center",
        headerAlign: "center",
        sortable: false,
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 1,
        renderCell: ({ row }) => (
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
          />
        ),
        headerAlign: "center",
        align: "center",
        sortable: false,
      },
    ],
    [],
  );

  const handleRowClick = useCallback<GridEventListener<"rowClick">>(
    (row, event) => {
      const isActionButtonClick =
        event.target instanceof Element &&
        event.target.classList.contains(".action-button");
      if (!isActionButtonClick) {
        // Handle row click logic only if it's not an action button click
        navigate(`/workflows/${row.id}`);
      }
    },
    [navigate],
  );

  useEffect(() => {
    handleRefreshWorkflows();
  }, []);

  return (
    <>
      <Paper sx={{ height: "80vh" }}>
        <DataGrid
          density="comfortable"
          columns={columns}
          rows={rows}
          onRowClick={handleRowClick}
          pagination
          paginationMode="server"
          pageSize={10}
          page={tablePage}
          rowCount={totalRows}
          onPageChange={setTablePage}
          disableDensitySelector
          disableSelectionOnClick
          hideFooterSelectedRowCount
          disableColumnMenu
          disableColumnSelector
          sx={{
            "&.MuiDataGrid-root .MuiDataGrid-cell:focus": {
              outline: "none",
            },
          }}
        />
      </Paper>
    </>
  );
};
