import { PrivateLayout } from 'modules/layout'
import ProviderContextWrapper from 'context/workflows/workflows-editor.context/provider-context-wrapper'
import { WorkflowsEditorComponent } from './components/workflows-editor.component'
import { Grid } from '@mui/material'
import { WorkflowsEditorProvider } from 'context/workflows/workflows-editor.context'
/**
 * Workflows editor page
 */

export const WorkflowsEditorPage = () => {

  return (
    <PrivateLayout>
      <Grid container >
        <Grid item xs={12}>
          <ProviderContextWrapper>
            <WorkflowsEditorProvider>
              <WorkflowsEditorComponent />
            </WorkflowsEditorProvider>
          </ProviderContextWrapper>
        </Grid>
      </Grid>
    </PrivateLayout>
  )
}

export default WorkflowsEditorPage
