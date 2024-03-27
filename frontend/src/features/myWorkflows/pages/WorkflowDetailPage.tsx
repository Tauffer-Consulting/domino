import { Grid } from "@mui/material";

import { WorkflowDetail } from "../components/WorkflowDetail";

/**
 * Workflows summary page
 */

export const WorkflowDetailPage: React.FC = () => {
  return (
    <Grid container rowGap={6}>
      <Grid item xs={12}>
        <WorkflowDetail />
      </Grid>
    </Grid>
  );
};
