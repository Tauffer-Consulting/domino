import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify'
import { DataGrid, GridColumns, GridActionsCellItem, GridRowId } from '@mui/x-data-grid';

import {
    Card,
    CircularProgress,
    Tooltip
} from '@mui/material';
// Icons
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
// import { toast } from "react-toastify";

// import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
// import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
// import ZoomInIcon from '@mui/icons-material/ZoomIn';

// import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import {
    useWorkflows,
} from 'context/workflows/workflows.context'


export const WorkflowsTable = () => {

    const {
        workflows,
        tablePage,
        setTablePage,
        tablePageSize,
        setTablePageSize,
        handleFetchWorkflow,
        handleRunWorkflow,
        handleDeleteWorkflow,
        handleRefreshWorkflows,
        setSelectedWorkflow,
        selectedWorkflow,
        setSelectedWorkflowRunId,
        handleRefreshWorkflowRuns,
    } = useWorkflows()

    const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);

    const deleteWorkflow = useCallback((id: GridRowId) => async () => {
        handleDeleteWorkflow(id as string).then(() => {
            toast.success('Workflow deleted.')
            handleRefreshWorkflows()
        }).catch((error) => {
            console.log(error)
            toast.error('Error deleting workflow.')
        })

    }, [handleDeleteWorkflow, handleRefreshWorkflows]);

    const runWorkflow = useCallback((id: GridRowId) => async () => {
        // TODO handle run workflow
        //const response = await handleRunWorkflow(id as string)
        handleRunWorkflow(id as string).then((response) => {
            if (selectedWorkflow?.id === id) {
                handleRefreshWorkflowRuns()
            }
            if (response.status === 204) {
                toast.success('Workflow started')
            }
        }).catch((err) => {
            if (err?.response?.status === 403) {
                toast.error('You are not allowed to run this workflow.')
            } else if (err?.response?.status === 404) {
                toast.error('Workflow not found.')
            } else if (err?.response?.status === 409) {
                toast.error('Workflow is not in a valid state. ')
            }
            else {
                toast.error('Something went wrong when starting the workflow.')
            }
        })

    }, [handleRunWorkflow, selectedWorkflow, handleRefreshWorkflowRuns]);


    const viewWorkflow = useCallback((id: GridRowId) => async () => {
        
        handleFetchWorkflow(id as string).then((workflow) => {
            setSelectedWorkflow(workflow)
            setSelectedWorkflowRunId(null)
            setSelectionModel([workflow.id])
            setSelectionModel([workflow.id]) // TODO check why this is returning Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
            if (workflow.id === selectedWorkflow?.id) {
                handleRefreshWorkflowRuns()
            }
        }).catch((err) => {
            if (err?.response?.status === 404) {
                toast.error('Workflow not found.')
            } else {
                toast.error('Something went wrong when fetching the workflow.')
            }
        })

    }, [
        handleFetchWorkflow, 
        setSelectedWorkflow, 
        setSelectedWorkflowRunId, 
        setSelectionModel, 
        handleRefreshWorkflowRuns, 
        selectedWorkflow
    ]);

    useEffect(() => {
        if (selectedWorkflow) {
            setSelectionModel([selectedWorkflow.id])
        }
    }, [selectedWorkflow, setSelectionModel])

    const columns = useMemo<GridColumns<any>>(
        () => [
            {
                field: 'view',
                type: 'actions',
                headerName: '',
                width: 70,
                //flex: 0.6,
                getActions: (params) => [
                    <GridActionsCellItem
                        icon={
                            <Tooltip title="View Workflow">
                                <RemoveRedEyeOutlinedIcon sx={{ color: "#8f02b3", fontSize: '26px' }} />
                            </Tooltip>
                        }
                        label="View"
                        onClick={viewWorkflow(params.id)}
                    />,
                ]
            },
            {
                field: 'id',
                headerName: 'ID',
                width: 50
            },
            {
                field: 'name',
                headerName: 'Name',
                minWidth: 250,
                flex: 1,
            },
            {
                field: 'createdAt',
                headerName: 'Creation Date',
                minWidth: 250,
                flex: 1,
                valueFormatter: ({ value }) => new Date(value).toLocaleString()
            },
            {
                field: 'lastModified',
                headerName: 'Last Modified',
                minWidth: 250,
                flex: 1,
                valueFormatter: ({ value }) => new Date(value).toLocaleString(),
            },
            { 
                field: 'scheduleInterval', 
                headerName: 'Schedule Interval', 
                width: 250,
                renderCell: (params) => {
                    if (params.value === 'creating') {
                        return (
                            <Tooltip title='Creating'>
                                <CircularProgress size={20} />
                            </Tooltip>
                        )
                    }
                    return params.value
                }
            },
            {
                field: 'active',
                headerName: 'Active',
                minWidth: 100,
                flex: 0.4,
                renderCell: (params) => {
                    if (params.value === 'creating') {
                        return (
                            <Tooltip title='Creating'>
                                <CircularProgress size={20} />
                            </Tooltip>
                        )
                    }
                    return params.value === true ? <CheckCircleOutlineIcon sx={{ color: "#02b120", fontSize: '26px' }} /> : <HighlightOffIcon sx={{ color: "#e71d1d", fontSize: '26px' }} />
                }
            },
            {
                field: 'paused',
                headerName: 'Paused',
                minWidth: 100,
                flex: 0.4,
                renderCell: (params) => {
                    if (params.value === 'creating'){
                        return (
                            <Tooltip title='Creating'>
                                <CircularProgress size={20} />
                            </Tooltip>
                        )
                    }
                    return params.value ? <PauseCircleOutlineIcon sx={{ color: "#e71d1d", fontSize: '26px' }} /> : <span/>
                }
            },
            {
                field: 'actions',
                type: 'actions',
                headerName: 'Actions',
                minWidth: 150,
                flex: 0.6,
                getActions: (params) => [
                    <GridActionsCellItem
                        icon={
                            params.row.active === 'creating' ?
                            <Tooltip title='Creating'>
                                <CircularProgress size={20} />
                            </Tooltip>
                            :
                            <Tooltip title="Delete Workflow">
                                <DeleteOutlineOutlinedIcon sx={{ color: "#e71d1d", fontSize: '26px' }} />
                            </Tooltip>
                        }
                        label="Delete"
                        onClick={deleteWorkflow(params.id)}
                    />,
                    <GridActionsCellItem
                        icon={
                            params.row.active === 'creating' ?
                            <Tooltip title='Creating'>
                                <CircularProgress size={20} />
                            </Tooltip>
                            :
                            <Tooltip title="Run Workflow">
                                <PlayCircleFilledWhiteOutlinedIcon sx={{ color: "#0086df", fontSize: '26px' }} />
                            </Tooltip>
                        }
                        label="Run"
                        onClick={runWorkflow(params.id)}
                    />,
                ],
            },
        ], [deleteWorkflow, runWorkflow, viewWorkflow]);

    const { rowsData, totalRows } = useMemo(() => {
        const rowsData = Array.isArray(workflows.data) ? workflows.data.map((workflow) => {
            return {
                id: workflow.id,
                name: workflow.name,
                createdAt: workflow.created_at,
                lastModified: workflow.last_changed_at,
                scheduleInterval: workflow.schedule_interval,
                active: workflow.is_active,
                paused: workflow.is_paused,
            }
        }) : []
        const totalRows = workflows.metadata?.total || 0
        return { rowsData, totalRows }
    }, [workflows])

    return (
        <>
            <Card
                variant='elevation'
                sx={{ height: 'fit-content', mt: 2, overflow: 'hidden' }}>
                <DataGrid
                    autoHeight
                    rows={rowsData}
                    columns={columns}
                    pageSize={tablePageSize}
                    rowsPerPageOptions={[5, 10, 20]}
                    onPageSizeChange={(newPageSize) => setTablePageSize(newPageSize)}
                    paginationMode="server"
                    pagination
                    //checkboxSelection
                    page={tablePage}
                    rowCount={totalRows}
                    onPageChange={(page) => setTablePage(page)}
                    sx={{
                        '&.MuiDataGrid-root .MuiDataGrid-cell:focus': {
                            outline: 'none',
                        },
                    }}
                    keepNonExistentRowsSelected
                    selectionModel={selectionModel}
                // onSelectionModelChange={handleSelectionModelChange}
                />
            </Card>
        </>
    )
}
