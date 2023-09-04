import { useAuthentication } from "context/authentication";
import { type FC } from "react";
import { Navigate } from "react-router-dom";

export interface IPublicRouteProps {
  /**
   * @todo type properly
   */
  component: any;
  /**
   * `true` if this route is accessible only for not authenticated users
   * @default false
   * */
  publicOnly?: boolean;
}

/**
 * Declares a route as public.
 */
export const PublicRoute: FC<IPublicRouteProps> = ({
  publicOnly,
  component: Component,
}) => {
  const { isLogged } = useAuthentication();
  return publicOnly && isLogged ? <Navigate to="/" replace /> : <Component />;
};

export default PublicRoute;
