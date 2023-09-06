import { Grid } from "@mui/material";
import PrivateLayout from "components/PrivateLayout";

import { WorkflowsEditorComponent } from "../components/WorkflowsEditor";
import WorkflowsEditorProvider from "../context/workflowsEditor";
/**
 * Workflows editor page
 */

export const WorkflowsEditorPage: React.FC = () => {
  return (
    <PrivateLayout>
      <Grid container>
        <Grid item xs={12}>
          <WorkflowsEditorProvider>
            <WorkflowsEditorComponent />
          </WorkflowsEditorProvider>
        </Grid>
      </Grid>
    </PrivateLayout>
  );
};
