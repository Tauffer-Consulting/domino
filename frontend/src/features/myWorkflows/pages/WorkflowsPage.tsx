import { Grid } from "@mui/material";
import { Breadcrumbs } from "components/Breadcrumbs";
import PrivateLayout from "components/PrivateLayout";

import { WorkflowList } from "../components/WorkflowsList";

/**
 * Workflows summary page
 */

export const WorkflowsPage: React.FC = () => {
  return (
    <PrivateLayout>
      <Grid container rowGap={2}>
        <Grid item xs={12}>
          <Breadcrumbs />
        </Grid>
        <Grid item xs={12}>
          <WorkflowList />
        </Grid>
      </Grid>
    </PrivateLayout>
  );
};
