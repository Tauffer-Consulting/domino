import { Paper, Skeleton } from "@mui/material";
import React from "react";

// import { Container } from './styles';

export const WorkflowsListSkeleton: React.FC = () => {
  return (
    <>
      <Paper sx={{ height: "80vh", backgroundColor: "transparent" }}>
        <Skeleton variant="rounded" sx={{ height: "100%" }} />
      </Paper>
    </>
  );
};
