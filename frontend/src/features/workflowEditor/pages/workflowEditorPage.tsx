import { Grid } from "@mui/material";

import { WorkflowsEditorComponent } from "../components/WorkflowEditor";
import WorkflowsEditorProviderWrapper from "../context";

export const WorkflowsEditorPage: React.FC = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <WorkflowsEditorProviderWrapper>
          <WorkflowsEditorComponent />
        </WorkflowsEditorProviderWrapper>
      </Grid>
    </Grid>
  );
};
