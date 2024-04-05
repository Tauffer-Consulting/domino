import { AuthRoutes } from "@features/auth/routes";
import React from "react";

export const publicRoutes = [
  {
    path: "/*",
    element: <AuthRoutes />,
  },
];
