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
import { FC, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { IWorkspaceSummary } from 'services/requests/workspaces'

export const WorkspacePendingListItem: FC<{
    workspace: IWorkspaceSummary
    selectedWorkspaceId: string | undefined
}> = ({ workspace, selectedWorkspaceId }) => {

    // TODO accept / refuse

    const handleAccept = useCallback(async()=>{
        console.log('Accept invitation')
    }, [])

    const handleRefuse = useCallback(async()=>{
        console.log('Refuse invitation')
    }, [])

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
                    borderColor: 'darkgray'
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
                                <Typography>Pending</Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </CardActionArea>
                <CardActions sx={{ width: '100%' }}>
                    <Button
                        size='small'
                        color='success'
                        onClick={handleAccept}
                    >
                       Accept
                    </Button>
                    <Button
                        size='small'
                        color='error'
                        onClick={handleRefuse}
                    >
                        Refuse
                    </Button>
                </CardActions>
            </Card>
        </Grid>
    )
}
