import { Grid } from "@mui/material";
import PrivateLayout from "components/PrivateLayout";

import { WorkflowDetail } from "../components/WorkflowDetail";

/**
 * Workflows summary page
 */

export const WorkflowDetailPage: React.FC = () => {
  return (
    <PrivateLayout>
      <Grid container rowGap={6}>
        <Grid item xs={12}>
          <WorkflowDetail />
        </Grid>
      </Grid>
    </PrivateLayout>
  );
};
