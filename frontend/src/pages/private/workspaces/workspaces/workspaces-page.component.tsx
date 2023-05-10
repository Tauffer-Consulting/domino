import { FC } from 'react'
import { Alert, Grid, Typography } from '@mui/material'

import { PrivateLayout } from 'modules/layout'
import { useWorkspaces } from 'context/workspaces/workspaces.context'

import { AddWorkspace } from './components/add-workspace.component'
import { WorkspaceListItem } from './components/item.component'

/**
 * Workspace list page
 * @todo handle error/loading/empty
 * @todo handle add new workspace
 */
export const WorkspacesPage: FC = () => {
  const {
    workspace,
    workspaces,
    workspacesError,
    workspacesLoading,
    handleRefreshWorkspaces,
    handleChangeWorkspace,
    handleDeleteWorkspace
  } = useWorkspaces()

  return (
    <PrivateLayout>
      <Typography variant='h6' component='h1' sx={{ mt: 7, mb: 2 }}>
        My workspaces
      </Typography>
      {workspacesError && (
        /* @TODO: cange alert to toast.error('Error loading workspaces') and add button ('click here to try again') */
        <Alert severity='warning' onClick={() => handleRefreshWorkspaces()}>
          Error loading workspaces, click here to try again
        </Alert>
      )}
      {workspacesLoading && (
        <Alert severity='info'>Loading your workspaces...</Alert>
      )}
      <Grid container spacing={{ xs: 1, lg: 2 }} alignItems='stretch'>
        <AddWorkspace />

        {workspaces.map((ws, index) => (
          <WorkspaceListItem
            workspace={ws}
            key={index}
            handleSelect={() => handleChangeWorkspace(ws.id)}
            handleDelete={() => handleDeleteWorkspace(ws.id)}
            selectedWorkspaceId={workspace?.id}
          />
        ))}
      </Grid>
    </PrivateLayout>
  )
}
