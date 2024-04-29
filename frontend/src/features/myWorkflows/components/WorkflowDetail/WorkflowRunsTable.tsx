/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useWorkspaces } from "@context/workspaces";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { Card, Grid, IconButton, Skeleton, Tooltip } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { NoDataOverlay } from "components/NoDataOverlay";
import { useRuns } from "features/myWorkflows/api";
import { type IWorkflowRuns } from "features/myWorkflows/types";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { secondsToHMS } from "utils";

import { States } from "./States";
import { WorkflowRunTableFooter } from "./WorkflowRunTableFooter";

interface Props {
  autoUpdate: boolean;
  workflowId: string;
  selectedRun: IWorkflowRuns | null;
  onSelectedRunChange: (run: IWorkflowRuns | null) => void;
  triggerRun: () => void;
}

export const WorkflowRunsTable: React.FC<Props> = ({
  autoUpdate,
  workflowId,
  selectedRun,
  onSelectedRunChange: setSelectedRun,
  triggerRun,
}) => {
  const navigation = useNavigate();
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const { workspace } = useWorkspaces();

  const {
    data: workflowRuns,
    isLoading,
    refetch,
  } = useRuns(
    {
      workspaceId: workspace?.id,
      page: paginationModel.page,
      pageSize: paginationModel.pageSize,
      workflowId,
    },
    {
      refetchInterval: () => (autoUpdate ? 1500 : false),
    },
  );

  const columns = useMemo<Array<GridColDef<IWorkflowRuns>>>(
    () => [
      {
        field: "start_date",
        headerName: "Start Date",
        headerAlign: "center",
        align: "center",
        type: "string",
        flex: 1,
        minWidth: 150,
        valueFormatter: ({ value }) => new Date(value).toLocaleString(),
      },
      {
        field: "end_date",
        headerName: "End Date",
        headerAlign: "center",
        align: "center",
        type: "string",
        flex: 1,
        minWidth: 150,
        valueFormatter: ({ value }) => new Date(value).toLocaleString(),
      },
      {
        field: "duration_in_seconds",
        headerName: "Duration",
        headerAlign: "center",
        align: "center",
        minWidth: 150,
        flex: 1,
        valueFormatter: ({ value }) => (value ? secondsToHMS(value) : "N/A"),
      },
      {
        field: "state",
        headerName: "State",
        headerAlign: "center",
        align: "center",
        type: "string",
        minWidth: 150,
        // flex: 1,
        renderCell: (params) => {
          return <States state={params.value} />;
        },
      },
      {
        field: "actions",
        headerName: "",
        maxWidth: 10,
        renderCell: ({ row }) => (
          <Tooltip title="Visualize workflow results">
            <span>
              <IconButton
                onClick={() => {
                  navigation(
                    `/my-workflows/${workflowId}/report/${row.workflow_run_id}`,
                  );
                }}
                disabled={row.state !== "success" && row.state !== "failed"}
              >
                <AssessmentIcon />
              </IconButton>
            </span>
          </Tooltip>
        ),
        headerAlign: "center",
        align: "center",
        sortable: false,
      },
    ],
    [],
  );

  const { rows, totalRows } = useMemo(
    () => ({
      // every column need a id prop in DataGrid component
      rows:
        workflowRuns?.data?.map((wr) => ({
          ...wr,
          id: wr.workflow_run_id,
        })) ?? [],
      totalRows: workflowRuns?.metadata?.total ?? 0,
    }),
    [workflowRuns],
  );

  useEffect(() => {
    if (!isLoading && workflowRuns?.data && workflowRuns?.data?.length > 0) {
      setSelectedRun(workflowRuns.data[0]);
    }
  }, [isLoading, workflowRuns]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card sx={{ height: "36vh" }}>
          {isLoading ? (
            <Skeleton
              animation="wave"
              variant="rounded"
              sx={{ height: "100%" }}
            />
          ) : (
            <DataGrid
              density="compact"
              onRowSelectionModelChange={([id]) => {
                setSelectedRun(
                  workflowRuns?.data?.find((wr) => wr.workflow_run_id === id) ??
                    null,
                );
              }}
              rowSelectionModel={
                selectedRun ? [selectedRun.workflow_run_id] : []
              }
              columns={columns}
              rows={rows}
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
              hideFooterSelectedRowCount
              disableColumnMenu
              disableColumnSelector
              slots={{
                noRowsOverlay: NoDataOverlay,
                footer: WorkflowRunTableFooter,
              }}
              slotProps={{
                footer: { triggerRun, refresh: refetch },
              }}
              sx={{
                "&.MuiDataGrid-root .MuiDataGrid-cell:focus": {
                  outline: "none",
                },
                "& .MuiDataGrid-row:hover": {
                  cursor: "pointer",
                },
              }}
            />
          )}
        </Card>
      </Grid>
    </Grid>
  );
};
