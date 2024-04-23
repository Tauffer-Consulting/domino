import { useWorkspaces } from "@context/workspaces";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { Box, Button, type SxProps, type Theme, Tooltip } from "@mui/material";
import { type Roles } from "@utils/roles";
import React, { type ReactNode } from "react";

interface IProps {
  children?: ReactNode;
  allowedRoles: Roles[];
  sx?: SxProps<Theme>;
}

export const AuthorizationComponent: React.FC<IProps> = ({
  allowedRoles,
  children,
  sx,
}) => {
  const { workspace } = useWorkspaces();

  const authorized = allowedRoles.some(
    (item) => workspace?.user_permission === item,
  );

  return authorized ? (
    <>{children}</>
  ) : React.isValidElement(children) && children.type === Button ? (
    <Tooltip
      title="You don't have enough permissions to access this feature"
      sx={sx}
    >
      <span>
        <Button disabled variant="contained">
          <ReportProblemIcon />
          Unauthorized
        </Button>
      </span>
    </Tooltip>
  ) : (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...sx,
      }}
    >
      <Tooltip title="You don't have enough permissions to access this feature">
        <ReportProblemIcon fontSize="large" color="warning" />
      </Tooltip>
    </Box>
  );
};
