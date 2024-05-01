import { lazyImport } from "@utils/lazyImports";
import React from "react";

const { AuthRoutes } = lazyImport(
  async () => await import("@features/auth/routes"),
  "AuthRoutes",
);

export const publicRoutes = [
  {
    path: "/*",
    element: <AuthRoutes />,
  },
];
