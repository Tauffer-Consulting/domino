/* eslint-disable react/prop-types */
import { useState, useMemo } from 'react'
import { useAuthenticatedGetWorkspaceUsers } from 'services/requests/workspaces'
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
    Card,
    CardHeader,
    CardContent,
    Grid,
} from '@mui/material'
import { useWorkspaces } from 'context/workspaces/workspaces.context';

const columns: GridColDef[] = [
    { 
        field: 'id', 
        headerName: '#', 
        width: 90, 
        hide: false 
    },
    {
        field: 'memberEmail',
        headerName: 'Member Email',
        flex: 1

    },
    {
        field: 'memberPermission',
        headerName: 'Member Permission',
        flex: 1
    }
];


const WorkspaceMembersCard = () => {

    const { workspace } = useWorkspaces()

    const [tablePageSize, setTablePageSize] = useState<number>(5);
    const [tablePage, setTablePage] = useState<number>(0);

    const {
        data: workspaceUsers,  
    } = useAuthenticatedGetWorkspaceUsers(workspace ? { workspaceId: workspace.id, page: tablePage, pageSize: tablePageSize } : { workspaceId: '', page: tablePage, pageSize: tablePageSize })


    const { rowsData, totalRows } = useMemo(()=> {
        if (!workspaceUsers) {
            return { rowsData: [], totalRows: 0}
        }
        const rowsData = []
        var id = tablePage * tablePageSize
        for (let element of workspaceUsers.data) {
            id = id + 1
            rowsData.push({
                id: id,
                memberEmail: element.user_email,
                memberPermission: element.user_permission,
            })
        }
        const totalRows = workspaceUsers.metadata?.total || 0
        return { rowsData, totalRows}

    }, [workspaceUsers, tablePage, tablePageSize])


    return (
        <Grid container>
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
                            pageSize={tablePageSize}
                            onPageSizeChange={(newPageSize) => setTablePageSize(newPageSize)}
                            paginationMode="server"
                            pagination
                            page={tablePage}
                            rowCount={totalRows}
                            onPageChange={(page) => setTablePage(page)}
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