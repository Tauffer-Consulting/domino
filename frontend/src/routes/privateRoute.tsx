import { useAuthentication } from "context/authentication";
import { useWorkspaces } from "context/workspaces";
import { type FC } from "react";
import { Navigate } from "react-router-dom";

interface IPrivateRouteProps {
  /**
   * @todo type properly
   */
  component: any;

  /**
   * `true` if this route is accessible only after selecting a workspace
   * @default false
   * */
  requireWorkspace?: boolean;
}

/**
 * Declares a route as private and checks for authentication & workspace.
 */
export const PrivateRoute: FC<IPrivateRouteProps> = ({
  component: Component,
  requireWorkspace,
}) => {
  const { isLogged } = useAuthentication();
  const { workspace } = useWorkspaces();

  /**
   * @todo simplify, **especially** if we have to add another state (maybe state machine?)
   * isLogged  |  requireWorkspace  |  !!workspace  |  page
   *   TRUE             TRUE               TRUE          go
   *   TRUE             TRUE               FALSE         /workspaces
   *   TRUE             FALSE              TRUE          go
   *   TRUE             FALSE              FALSE         go
   *   FALSE            TRUE               TRUE          /sign-in
   *   FALSE            TRUE               FALSE         /sign-in
   *   FALSE            FALSE              TRUE          /sign-in
   *   FALSE            FALSE              FALSE         /sign-in
   */

  switch (true) {
    case isLogged && requireWorkspace && !workspace:
      return <Navigate to="/workspaces" replace />;

    case isLogged && requireWorkspace && !!workspace:
    case isLogged && !requireWorkspace:
      return <Component />;

    default:
      return <Navigate to="/sign-in" replace />;
  }
};
