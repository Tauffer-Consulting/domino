import { Grid } from "@mui/material";
import { WorkflowsEditorProvider } from "context/workflows/workflowsEditor.context";
import ProviderContextWrapper from "context/workflows/workflowsEditor.context/providerContextWrapper";
import { PrivateLayout } from "modules/layout";

import { WorkflowsEditorComponent } from "./components/workflowsEditor.component";
/**
 * Workflows editor page
 */

export const WorkflowsEditorPage = () => {
  return (
    <PrivateLayout>
      <Grid container>
        <Grid item xs={12}>
          <ProviderContextWrapper>
            <WorkflowsEditorProvider>
              <WorkflowsEditorComponent />
            </WorkflowsEditorProvider>
          </ProviderContextWrapper>
        </Grid>
      </Grid>
    </PrivateLayout>
  );
};

export default WorkflowsEditorPage;
