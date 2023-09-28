import { Button, Card, Grid, Skeleton } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { NoDataOverlay } from "components/NoDataOverlay";
import { useAuthenticatedGetWorkflowRuns } from "features/workflows/api";
import { type IWorkflowRuns } from "features/workflows/types";
import React, { useEffect, useMemo } from "react";
import { useInterval } from "utils";

import { States } from "./States";

interface Props {
  workflowId: string;
  selectedRunId: string | null;
  setSelectedRunId: React.Dispatch<React.SetStateAction<string | null>>;
  triggerRun: () => void;
}

export const WorkflowRunsTable: React.FC<Props> = ({
  workflowId,
  selectedRunId,
  setSelectedRunId,
  triggerRun,
}) => {
  const [paginationModel, setPaginationModel] = React.useState({
    pageSize: 10,
    page: 0,
  });

  const {
    data: workflowRuns,
    isLoading,
    mutate: handleRefreshWorkflowsRun,
  } = useAuthenticatedGetWorkflowRuns({
    page: paginationModel.page,
    pageSize: paginationModel.pageSize,
    workflowId,
  });

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
      setSelectedRunId(workflowRuns.data[0].workflow_run_id);
    }
  }, [isLoading, workflowRuns]);

  useInterval(handleRefreshWorkflowsRun, 3000);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Grid container spacing={3} justifyContent="end">
          <Grid item xs={1}>
            <Button onClick={triggerRun} variant="contained">
              {" "}
              New Run{" "}
            </Button>
          </Grid>
          <Grid item xs={1}>
            <Button variant="contained"> Cancel </Button>
          </Grid>
          <Grid item xs={1}>
            <Button variant="contained"> Refresh</Button>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ height: "40vh" }}>
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
                setSelectedRunId(id as string);
              }}
              rowSelectionModel={selectedRunId ? [selectedRunId] : []}
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
              slots={{ noRowsOverlay: NoDataOverlay }}
              sx={{
                "&.MuiDataGrid-root .MuiDataGrid-cell:focus": {
                  outline: "none",
                },
              }}
            />
          )}
        </Card>
      </Grid>
    </Grid>
  );
};
