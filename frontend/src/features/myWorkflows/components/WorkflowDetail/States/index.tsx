import { Chip, useTheme } from "@mui/material";
import { type IWorkflowRuns } from "features/myWorkflows/types";
import React from "react";

interface Props {
  state: IWorkflowRuns["state"];
}

export const States: React.FC<Props> = ({ state }) => {
  const theme = useTheme();

  if (state === "success") {
    return (
      <Chip
        label="Success"
        color="success"
        style={{
          backgroundColor: theme.palette.success.main,
          color: theme.palette.success.contrastText,
          fontWeight: "bold",
        }}
      />
    );
  }
  if (state === "failed") {
    return (
      <Chip
        label="Failed"
        color="error"
        style={{
          backgroundColor: theme.palette.error.main,
          color: theme.palette.success.contrastText,
          fontWeight: "bold",
        }}
      />
    );
  }
  if (state === "queued") {
    return (
      <Chip
        label="Queued"
        color="info"
        style={{
          backgroundColor: theme.palette.action.disabledBackground,
          fontWeight: "bold",
        }}
      />
    );
  }
  if (state === "running") {
    return (
      <Chip
        label="Running"
        color="info"
        style={{
          backgroundColor: theme.palette.info.light,
          color: theme.palette.info.contrastText,
          fontWeight: "bold",
        }}
      />
    );
  }
};
