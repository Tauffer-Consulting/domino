import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { CircularProgress, Tooltip } from "@mui/material";
import theme from "providers/theme.config";
import React from "react";
// import { Container } from './styles';

interface Props {
  status: "creating" | "failed" | "active";
}

export const Status: React.FC<Props> = ({ status }) => {
  if (status === "creating") {
    return (
      <Tooltip title="Creating">
        <CircularProgress size={20} />
      </Tooltip>
    );
  } else if (status === "failed") {
    return (
      <Tooltip title="Failed">
        <HighlightOffIcon
          sx={{ color: theme.palette.error.main, fontSize: "26px" }}
        />
      </Tooltip>
    );
  } else if (status === "active") {
    return (
      <Tooltip title="Active">
        <CheckCircleOutlineIcon
          sx={{ color: theme.palette.success.main, fontSize: "26px" }}
        />
      </Tooltip>
    );
  }
  return (
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    <Tooltip title={`Unknown status: ${status}`}>
      <HelpOutlineIcon
        sx={{ color: theme.palette.grey[500], fontSize: "26px" }}
      />
    </Tooltip>
  );
};
