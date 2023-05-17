/* eslint-disable react/prop-types */
import { useState, useMemo, useCallback } from 'react'
import { DataGrid, GridColumns, GridActionsCellItem } from '@mui/x-data-grid';
import {
    Card,
    CardHeader,
    CardContent,
    Grid,
    Tooltip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button
} from '@mui/material'
import { useWorkspaces } from 'context/workspaces/workspaces.context';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';


const WorkspaceMembersCard = () => {

    const {
        workspace, 
        handleRemoveUserWorkspace,
        workspaceUsersTablePage,
        setWorkspaceUsersTablePage,
        workspaceUsersTablePageSize,
        setWorkspaceUsersTablePageSize,
        workspaceUsers,
        workspaceUsersRefresh
    } = useWorkspaces()

    const [removeUserId, setRemoveUserId] = useState<any>('');
    const [isOpenRemoveDialog, setIsOpenRemoveDialog] = useState<boolean>(false);


    const columns = useMemo<GridColumns<any>>(
        () => [
            {
                field: 'id',
                headerName: 'User Id',
                flex: 1,
                hide: true

            },
            {
                field: 'count',
                headerName: '#',
                width: 90
            },
            {
                field: 'memberEmail',
                headerName: 'Member Email',
                flex: 1

            },
            {
                field: 'memberPermission',
                headerName: 'Member Permission',
                flex: 1,
                valueFormatter: ({ value }) => value.charAt(0).toUpperCase() + value.slice(1)
            },
            {
                field: 'status',
                headerName: 'Status',
                flex: 1,
                valueFormatter: ({ value }) => value.charAt(0).toUpperCase() + value.slice(1)

            },
            {
                field: 'actions',
                type: 'actions',
                headerName: 'Remove',
                minWidth: 150,
                flex: 0.6,
                hide: workspace?.user_permission === 'owner' ?  false : true,
                getActions: (params) => [
                    <GridActionsCellItem
                        icon={
                            <Tooltip title="Remove User">
                                <DeleteOutlineOutlinedIcon sx={{ color: "#e71d1d", fontSize: '26px' }} />
                            </Tooltip>
                        }
                        label="Delete"
                        onClick={() => { setRemoveUserId(params.id); setIsOpenRemoveDialog(true) }}
                    />
                ],
            },
        ], [workspace]);

    const { rowsData, totalRows } = useMemo(()=> {
        if (!workspaceUsers) {
            return { rowsData: [], totalRows: 0}
        }
        const rowsData = []
        var count = workspaceUsersTablePage * workspaceUsersTablePageSize
        for (let element of workspaceUsers.data) {
            count = count + 1
            rowsData.push({
                id: element.user_id,
                count: count,
                memberEmail: element.user_email,
                status: element.status,
                memberPermission: element.user_permission,
            })
        }
        const totalRows = workspaceUsers.metadata?.total || 0
        return { rowsData, totalRows}

    }, [workspaceUsers, workspaceUsersTablePage, workspaceUsersTablePageSize])

    const removeUser = useCallback(async () => {
        if (workspace && removeUserId) {
            handleRemoveUserWorkspace(workspace?.id, removeUserId)
        }
        setIsOpenRemoveDialog(false)
        setRemoveUserId(null)
        workspaceUsersRefresh()
    }, [workspace, removeUserId, handleRemoveUserWorkspace, workspaceUsersRefresh])


    return (
        <Grid container>
            <Dialog
                open={isOpenRemoveDialog}
                onClose={() => setIsOpenRemoveDialog(false)}
                aria-labelledby="alert-remove-dialog-title"
                aria-describedby="alert-remove-dialog-description"
            >
                <DialogTitle id="alert-remove-dialog-title">
                    {"Confirm Remove Member"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to remove this user from this workspace?
                        You can always add the user back later.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsOpenRemoveDialog(false)}>Cancel</Button>
                    <Button onClick={removeUser} variant='outlined' color='error'>
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>
            <Card sx={{width: "100%"}}>
                <CardHeader
                    title="Workspace Members"
                    titleTypographyProps={{ variant: 'h6' }}
                />
                <CardContent>
                    <div style={{ height: 350, width: '100%' }}>
                        <DataGrid
                            autoHeight
                            rows={rowsData}
                            columns={columns}
                            rowsPerPageOptions={[5, 10, 20]}
                            pageSize={workspaceUsersTablePageSize}
                            onPageSizeChange={(newPageSize) => setWorkspaceUsersTablePageSize(newPageSize)}
                            paginationMode="server"
                            pagination
                            page={workspaceUsersTablePage}
                            rowCount={totalRows}
                            onPageChange={(page) => setWorkspaceUsersTablePage(page)}
                            sx={{
                                '&.MuiDataGrid-root .MuiDataGrid-cell:focus': {
                                    outline: 'none',
                                },
                            }}
                            keepNonExistentRowsSelected
                        // onSelectionModelChange={handleSelectionModelChange}
                        />
                    </div>
                </CardContent>
            </Card>
        </Grid>
    );
}

export default WorkspaceMembersCard;