import {
  Autorenew,
  Check,
  Close,
  HourglassTop,
  Remove,
} from "@mui/icons-material";
import { type IWorkflowRuns } from "features/myWorkflows/types";
import React from "react";

interface Props {
  state: IWorkflowRuns["state"];
}

export const RunState: React.FC<Props> = ({ state }) => {
  const stateTitle = state[0].toUpperCase() + state.slice(1);

  if (state === "success") {
    return (
      <>
        <Check fontSize="small" />
        {stateTitle}
      </>
    );
  }
  if (state === "failed") {
    return (
      <>
        <Close fontSize="small" />
        {stateTitle}
      </>
    );
  }
  if (state === "queued") {
    return (
      <>
        <HourglassTop fontSize="small" />
        {stateTitle}
      </>
    );
  }
  if (state === "running") {
    return (
      <>
        <Autorenew fontSize="small" />
        {stateTitle}
      </>
    );
  }
  if (state === "none") {
    return (
      <>
        <Remove fontSize="small" />
        {stateTitle}
      </>
    );
  }
};
