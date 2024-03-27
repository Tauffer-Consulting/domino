import PrivateLayout from "@components/PrivateLayout";
import { useAuthentication } from "@context/authentication";
import { type FC, type ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";

interface Props {
  children?: ReactNode;
}

/**
 * @returns PrivateRoute redirect to `/sign-in` if the user are NOT logged
 */
export const PrivateRoute: FC<Props> = () => {
  const { isLogged } = useAuthentication();

  if (!isLogged) {
    return <Navigate replace to="/sign-in" />;
  }

  return (
    <PrivateLayout>
      <Outlet />
    </PrivateLayout>
  );
};
