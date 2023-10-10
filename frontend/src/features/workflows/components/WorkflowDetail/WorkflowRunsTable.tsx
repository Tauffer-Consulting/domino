import { Card, Grid, Skeleton } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { NoDataOverlay } from "components/NoDataOverlay";
import { useAuthenticatedGetWorkflowRuns } from "features/workflows/api";
import { type IWorkflowRuns } from "features/workflows/types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useInterval } from "utils";

import { States } from "./States";
import { WorkflowRunTableFooter } from "./WorkflowRunTableFooter";

interface Props {
  workflowId: string;
  selectedRun: IWorkflowRuns | null;
  autoUpdate: boolean;
  setAutoUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  onSelectedRunChange: (run: IWorkflowRuns | null) => void;
  triggerRun: () => void;
}

export const WorkflowRunsTable: React.FC<Props> = ({
  workflowId,
  selectedRun,
  onSelectedRunChange: setSelectedRun,
  triggerRun,
  autoUpdate,
  setAutoUpdate,
}) => {
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  const {
    data: workflowRuns,
    isLoading,
    mutate: refetchWorkflowsRun,
  } = useAuthenticatedGetWorkflowRuns({
    page: paginationModel.page,
    pageSize: paginationModel.pageSize,
    workflowId,
  });

  const handleRefreshWorkflowsRuns = useCallback(async () => {
    if (
      workflowRuns &&
      workflowRuns.data?.some(
        (wr) => wr.state !== "success" && wr.state !== "failed",
      )
    ) {
      setAutoUpdate(true);
    } else if (workflowRuns) {
      setAutoUpdate(false);
    }
    void refetchWorkflowsRun();
  }, [workflowRuns, setAutoUpdate]);

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
        field: "execution_date",
        headerName: "Execution Date",
        headerAlign: "center",
        align: "center",
        minWidth: 150,
        flex: 1,
        valueFormatter: ({ value }) => new Date(value).toLocaleString(),
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

  useInterval(handleRefreshWorkflowsRuns, 3000, autoUpdate);

  const newRun = useCallback(() => {
    triggerRun();
    setAutoUpdate(true);
  }, [triggerRun, setAutoUpdate]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card sx={{ height: "35vh" }}>
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
                footer: { triggerRun: newRun },
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
