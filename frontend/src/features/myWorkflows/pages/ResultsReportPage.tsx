import { Grid } from "@mui/material";
import PrivateLayout from "components/PrivateLayout";
import React from "react";

import { ResultsReport } from "../components/ResultsReport";

export const ResultsReportPage: React.FC = () => {
  return (
    <PrivateLayout>
      <Grid container rowGap={6}>
        <Grid item xs={12}>
          <ResultsReport />
        </Grid>
      </Grid>
    </PrivateLayout>
  );
};
