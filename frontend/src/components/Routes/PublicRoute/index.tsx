import { useAuthentication } from "context/authentication";
import { type ReactNode, type FC } from "react";
import { Navigate, Outlet } from "react-router-dom";

export interface Props {
  children?: ReactNode;
  /**
   * `true` if this route is accessible only for not authenticated users
   * @default false
   * */
  publicOnly?: boolean;
}

export const PublicRoute: FC<Props> = ({ publicOnly }) => {
  const { isLogged } = useAuthentication();
  return publicOnly && isLogged ? (
    <Navigate to="/workspaces" replace />
  ) : (
    <Outlet />
  );
};
