import { PrivateLayout } from 'modules/layout'
import { WorkflowsEditorComponent } from './components/workflows-editor.component'
import { Grid } from '@mui/material'
/**
 * Workflows editor page
 */

export const WorkflowsEditorPage = () => {

  return (
    <PrivateLayout>
      <Grid container >
        <Grid item xs={12}>
          <WorkflowsEditorComponent />
        </Grid>
      </Grid>
    </PrivateLayout>
  )
}

export default WorkflowsEditorPage
