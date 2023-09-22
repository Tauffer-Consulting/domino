import { Grid } from "@mui/material";
import { Breadcrumbs } from "components/Breadcrumbs";
import PrivateLayout from "components/PrivateLayout";

import { WorkflowList } from "../components/WorkflowsList";
import { WorkflowsProvider } from "../context/workflows";

/**
 * Workflows summary page
 */

export const WorkflowsPage: React.FC = () => {
  return (
    <PrivateLayout>
      <WorkflowsProvider>
        <Grid container rowGap={6}>
          <Grid item xs={12}>
            <Breadcrumbs />
          </Grid>
          <Grid item xs={12}>
            <WorkflowList />
          </Grid>
        </Grid>
      </WorkflowsProvider>
    </PrivateLayout>
  );
};
