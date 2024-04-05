import { Grid } from "@mui/material";
import React from "react";

import { ResultsReport } from "../components/ResultsReport";

export const ResultsReportPage: React.FC = () => {
  return (
    <Grid container rowGap={6}>
      <Grid item xs={12}>
        <ResultsReport />
      </Grid>
    </Grid>
  );
};
