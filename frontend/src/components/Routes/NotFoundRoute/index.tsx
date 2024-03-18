import { useAuthentication } from "@context/authentication";
import { type ReactNode, type FC } from "react";
import { Navigate, useLocation } from "react-router-dom";

export interface Props {
  children?: ReactNode;
}

export const NotFoundRoute: FC<Props> = () => {
  const { isLogged } = useAuthentication();
  const { state } = useLocation();

  if (isLogged) {
    return state && state.from === "/" ? (
      <>
        <Navigate to="/workspaces" replace />
      </>
    ) : (
      <>
        <h1>404 - Not Found</h1>
      </>
    );
  } else {
    return state && state.from === "/" ? (
      <>
        <Navigate to="/sign-in" replace />
      </>
    ) : (
      <>
        <h1>404 - Not Found</h1>
      </>
    );
  }
};
