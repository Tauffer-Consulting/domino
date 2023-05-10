import { Box, Grid } from '@mui/material'
import { PrivateLayout } from 'modules/layout'
import { WorkspaceSettingsProvider } from 'context/workspaces/workspace-settings.context'
import { withContext } from 'common/hocs/with-context.hoc'
import { RepositoriesCard } from './components/repositories-card.component'
import WorkspaceSecretsCard from './components/workspace-secrets-card.component'
import { UsersCard } from './components/users-card.component'
import SecretsCard from './components/repository-secrets-card.component'
import StorageSecretsCard from './components/storage-secrets-card.component'
import { useWorkspaceSettings } from 'context/workspaces/workspace-settings.context'
/**
 * @todo break into smaller components
 * @todo handle add repository
 * @todo handle add users
 * @todo improve loading/error states
 * @returns Workspace settings component
 */
export const WorkspaceSettingsPage = withContext(WorkspaceSettingsProvider, () => {

  const {
    selectedRepositoryId
  } = useWorkspaceSettings()

  return (
    <PrivateLayout>
      <Box sx={{ mt: 2 }} />
      <Grid container spacing={3} style={{ maxWidth: '1440px', margin: '0 auto' }}>
        <Grid item xs={12} lg={12}>
          <WorkspaceSecretsCard/>
        </Grid>
        <Grid item xs={12} lg={12}>
          <RepositoriesCard />
        </Grid>
        <Grid item xs={12} lg={12}>
          <SecretsCard repositoryId={selectedRepositoryId} />
        </Grid>
        <Grid item xs={12} lg={12}>
          <StorageSecretsCard />
        </Grid>
        <Grid item xs={12} lg={12}>
          <UsersCard />
        </Grid>
      </Grid>
    </PrivateLayout>
  )
})
