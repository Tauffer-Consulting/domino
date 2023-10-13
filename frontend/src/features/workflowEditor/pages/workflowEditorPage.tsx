import { Grid } from "@mui/material";
import PrivateLayout from "components/PrivateLayout";

import { WorkflowsEditorComponent } from "../components/WorkflowEditor";
import WorkflowsEditorProviderWrapper from "../context";
/**
 * Workflows editor page
 */

export const WorkflowsEditorPage: React.FC = () => {
  return (
    <PrivateLayout>
      <Grid container>
        <Grid item xs={12}>
          <WorkflowsEditorProviderWrapper>
            <WorkflowsEditorComponent />
          </WorkflowsEditorProviderWrapper>
        </Grid>
      </Grid>
    </PrivateLayout>
  );
};
