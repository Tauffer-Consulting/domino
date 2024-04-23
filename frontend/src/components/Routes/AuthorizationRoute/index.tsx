import { useWorkspaces } from "@context/workspaces";
import { type Roles } from "@utils/roles";
import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

type Props = {
  children?: ReactNode;
} & {
  requireWorkspace?: boolean;
  allowedRoles?: Roles[];
};

/**
 * Component for authorization routing.
 * @returns {React.ReactElement} - JSX for authorization routing.
 * @example Example usage:
 * <AuthorizationRoute
 *  requireWorkspace
 *  allowedRoles={['owner', 'read']}
 * >
 *  <PrivateContent />
 * </AuthorizationRoute>
 *  @description Truth Table:
 *  | requireWorkspace | allowedRoles.length | workspace | Result                    |
 *  |------------------|---------------------|-----------|---------------------------|
 *  | false            | 0                   | null      | Render children           |
 *  | false            | 0                   | not null  | Redirect to forbidden |
 *  | false            | > 0                 | null      | Redirect to workspaces    |
 *  | false            | > 0                 | not null  | Check permission          |
 *  | true             | 0                   | null      | Redirect to workspaces    |
 *  | true             | 0                   | not null  | Render children           |
 *  | true             | > 0                 | null      | Redirect to workspaces    |
 *  | true             | > 0                 | not null  | Check permission          |
 */
export const AuthorizationRoute = ({
  requireWorkspace = false,
  allowedRoles = [],
  children,
}: Props): React.ReactElement => {
  const { workspace } = useWorkspaces();

  // Redirect if workspace is required but not available
  if (requireWorkspace && !workspace) {
    return <Navigate to="/workspaces" replace />;
  }

  // Redirect if no workspace but allowed roles specified
  if (!requireWorkspace && allowedRoles.length > 0 && !workspace) {
    return <Navigate to="/workspaces" replace />;
  }

  // No workspace required and no roles specified, render children
  if (!requireWorkspace && allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Workspace required and no roles specified, render children
  if (requireWorkspace && workspace && allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if the user has permission for allowed roles
  if (workspace && allowedRoles.length > 0) {
    const hasPermission =
      workspace.user_permission &&
      allowedRoles.includes(workspace.user_permission);

    return hasPermission ? (
      <>{children}</>
    ) : (
      <Navigate to="/forbidden" replace />
    );
  }

  // Redirect to forbidden if no other conditions met
  return <Navigate to="/forbidden" replace />;
};
