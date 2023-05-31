import {
    Card,
    CardActionArea,
    CardHeader,
    CardContent,
    Typography,
    CardActions,
    Button,
    Grid
} from '@mui/material'
import { FC } from 'react'
import { useWorkspaces } from 'context/workspaces/workspaces.context'
import { IWorkspaceSummary } from 'services/requests/workspaces'

export const WorkspacePendingListItem: FC<{
    workspace: IWorkspaceSummary
    selectedWorkspaceId: string | undefined
}> = ({ workspace }) => {

    const { handleAcceptWorkspaceInvite, handleRejectWorkspaceInvite } = useWorkspaces()

    return (
        <Grid
            item
            xs={12}
            md={6}
            lg={4}
            xl={3}
            sx={{ display: 'flex', flexDirection: 'column' }}
        >
            <Card
                variant='outlined'
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderColor: '#f90'
                }}
            >
                <CardActionArea
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        flexGrow: 1
                    }}
                >
                    <CardHeader
                        title={workspace.workspace_name}
                        titleTypographyProps={{ variant: 'body1' }}
                    />
                    <CardContent sx={{width: '100%'}}>
                        <Grid container>
                            <Grid item xs={12} md={3}>
                                <Typography sx={{ fontSize: 14, my: 0 }} color='text.secondary'>
                                    Permission:
                                </Typography>
                                <Typography>{workspace.user_permission}</Typography>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Typography sx={{ fontSize: 14, my: 0 }} color='text.secondary'>
                                    Status:
                                </Typography>
                                <Typography color="#f90">Pending</Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </CardActionArea>
                <CardActions sx={{ width: '100%' }}>
                    <Button
                        size='small'
                        color='success'
                        onClick={() => handleAcceptWorkspaceInvite(workspace.id)}
                    >
                       Accept
                    </Button>
                    <Button
                        size='small'
                        color='error'
                        onClick={() => handleRejectWorkspaceInvite(workspace.id)}
                    >
                        Refuse
                    </Button>
                </CardActions>
            </Card>
        </Grid>
    )
}
