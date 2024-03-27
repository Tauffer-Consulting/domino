import { useWorkspaces } from "@context/workspaces";
import { type Roles } from "@utils/roles";
import React, { type ReactNode } from "react";

interface IProps {
  children?: ReactNode;
  allowedRoles: Roles[];
}

export const RequireRoleComponent: React.FC<IProps> = ({
  allowedRoles,
  children,
}) => {
  const { workspace } = useWorkspaces();

  const authorized = allowedRoles.some(
    (item) => workspace?.user_permission === item,
  );

  return authorized ? <>{children}</> : <div>Not authorized</div>;
};
