import { Card, Grid, Skeleton } from "@mui/material";
import React from "react";

export const WorkflowDetailSkeleton: React.FC = () => {
  return (
    <Grid container spacing={3} alignItems="stretch">
      <Grid item xs={12}>
        <Card sx={{ height: "40vh", backgroundColor: "transparent" }}>
          <Skeleton variant="rounded" sx={{ height: "100%" }} />
        </Card>
      </Grid>
      <Grid item xs={8}>
        <Card sx={{ height: "80vh", backgroundColor: "transparent" }}>
          <Skeleton variant="rounded" sx={{ height: "100%" }} />
        </Card>
      </Grid>
      <Grid item xs={4}>
        <Card sx={{ height: "80vh", backgroundColor: "transparent" }}>
          <Skeleton variant="rounded" sx={{ height: "100%" }} />
        </Card>
      </Grid>
    </Grid>
  );
};
