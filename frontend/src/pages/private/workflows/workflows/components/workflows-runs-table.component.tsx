import { useMemo, useCallback, useState, useEffect } from 'react';
import { DataGrid, GridColumns, GridRowId, GridActionsCellItem } from '@mui/x-data-grid';

import { Card, Chip, Grid, Tooltip } from '@mui/material';
import { useWorkflows } from 'context/workflows/workflows.context';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';


export const WorkflowsRunsTable = () => {

    const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);
    const updateTime = 5000 // ms

    const {
        runsTablePageSize,
        setRunsTablePageSize,
        runsTablePage,
        setRunsTablePage,
        workflowRuns,
        setSelectedWorkflowRunId,
        selectedWorkflowRunId,
        handleRefreshWorkflowRuns
    } = useWorkflows()


    const viewRun = useCallback((id: GridRowId) => () => {
        setSelectedWorkflowRunId(id as string || null)
        id ? setSelectionModel([id]) : setSelectionModel([])
    }, [setSelectionModel, setSelectedWorkflowRunId]);


    const columns = useMemo<GridColumns<any>>(
        () => [
            {
                field: 'view',
                type: 'actions',
                headerName: '',
                width: 70,
                getActions: (params) => [
                    <GridActionsCellItem
                        icon={
                            <Tooltip title="View Workflow Run">
                                <RemoveRedEyeOutlinedIcon sx={{ color: "#8f02b3", fontSize: '26px' }} />
                            </Tooltip>
                        }
                        label="View"
                        onClick={viewRun(params.id)}
                    />,
                ]
            },
            { 
                field: 'id', 
                headerName: 'Run ID', 
                width: 90, 
                hide: true 
            },
            {
                field: 'startDate',
                headerName: 'Start Date',
                type: 'string',
                flex: 1,
                minWidth: 150,
                valueFormatter: ({ value }) => new Date(value).toLocaleString(),
            },
            {
                field: 'endDate',
                headerName: 'End Date',
                type: 'string',
                flex: 1,
                minWidth: 150,
                valueFormatter: ({ value }) => new Date(value).toLocaleString(),
            },
            {
                field: 'executionDate',
                headerName: 'Execution Date',
                minWidth: 150,
                flex: 1,
                valueFormatter: ({ value }) => new Date(value).toLocaleString(),
            },
            {
                field: 'state',
                headerName: 'State',
                type: 'string',
                minWidth: 150,
                //flex: 1,
                renderCell: (params) => {
                    // todo add other states
                    if (params.value === 'success') {
                        return (
                            // <Tooltip title="Success">
                            //     <CheckCircleOutlineIcon sx={{ color: "#02b120", fontSize: '26px' }} />
                            // </Tooltip>
                            <Chip label="Success" color='success' style={{ backgroundColor: '#02b120', fontWeight: 'bold' }} />
                        )
                    }
                    if (params.value === 'failed') {
                        return (
                            // <Tooltip title='Failed'>
                            //     <HighlightOffIcon sx={{ color: "#ff0000", fontSize: '26px' }} />
                            // </Tooltip>
                            <Chip label="Failed" color='error' style={{ backgroundColor: '#ff0000', fontWeight: 'bold' }} />
                        )
                    }
                    if (params.value === 'queued') {
                        return (
                            <Chip label="Queued" color='info' style={{ backgroundColor: '#aaaaaa', fontWeight: 'bold' }} />
                        )
                    }
                    if (params.value === 'running') {
                        return (
                            <Chip label="Running" color='info' style={{ backgroundColor: '#00b0ff', fontWeight: 'bold' }} />
                        )
                    }
                }
            },
        ], [viewRun]);


    useEffect(() => {
        if (selectedWorkflowRunId) {
            setSelectionModel([selectedWorkflowRunId]) 
        }
    }, [selectedWorkflowRunId, setSelectionModel])


    const { rowsData, totalRows } = useMemo(() => {
        const rowsData = Array.isArray(workflowRuns.data) ? workflowRuns.data.map((run) => {
            return {
                id: run.workflow_run_id,
                startDate: run.start_date,
                endDate: run.end_date,
                executionDate: run.execution_date,
                state: run.state,
            }
        }) : []
        const totalRows = workflowRuns.metadata?.total || 0
        return { rowsData, totalRows }
    }, [workflowRuns])

    useEffect(() => {
        // Update the table every X seconds if there are any running workflows
        const interval = setInterval(() => {
            var shouldUpdate = false
            for (const run of rowsData) {
                if ((run.state !== "success") && (run.state !== "failed")) {
                    shouldUpdate = true
                }
            }
            if (shouldUpdate) {
                handleRefreshWorkflowRuns()
            }else{
                clearInterval(interval)
            }
        }, updateTime); // Update every X seconds
        return () => clearInterval(interval);
    }, [rowsData, handleRefreshWorkflowRuns])

    return (
        <>
        <Grid item xs={12}>
            <Card
                variant='elevation'
                sx={{ height: '650px', mt: 2, overflow: 'hidden' }}>
                <DataGrid
                    rows={rowsData}
                    columns={columns}
                    pageSize={runsTablePageSize}
                    rowsPerPageOptions={[5, 10, 20]}
                    onPageSizeChange={(newPageSize) => setRunsTablePageSize(newPageSize)}
                    paginationMode="server"
                    pagination
                    page={runsTablePage}
                    rowCount={totalRows}
                    onPageChange={(page) => setRunsTablePage(page)}
                    sx={{
                        '&.MuiDataGrid-root .MuiDataGrid-cell:focus': {
                            outline: 'none',
                        },
                    }}
                    keepNonExistentRowsSelected
                    selectionModel={selectionModel}
                    />
            </Card>
        </Grid>
        </>
    )
}
