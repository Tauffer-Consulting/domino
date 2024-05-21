import { useAuthentication } from "@context/authentication";
import { useRoutes } from "react-router-dom";

import { protectedRoutes } from "./protected";
import { publicRoutes } from "./public";

export const AppRoutes = () => {
  const { isLogged } = useAuthentication();

  const routes = isLogged ? protectedRoutes : publicRoutes;

  const element = useRoutes(routes);

  return <>{element}</>;
};
