import { AuthorizationRoute, PrivateRoute } from "@components/Routes";
import React from "react";
import { Route, Routes } from "react-router-dom";

import { WorkspaceSettingsPage, WorkspacesPage } from "../pages";

export const WorkspaceRoute: React.FC = () => {
  return (
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route index element={<WorkspacesPage />} />
        <Route
          path="settings"
          element={
            <AuthorizationRoute allowedRoles={["owner", "admin"]}>
              <WorkspaceSettingsPage />
            </AuthorizationRoute>
          }
        />
      </Route>
    </Routes>
  );
};
