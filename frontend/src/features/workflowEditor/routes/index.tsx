import { AuthorizationRoute, PrivateRoute } from "@components/Routes";
import React from "react";
import { Route, Routes } from "react-router-dom";

import { WorkflowsEditorPage } from "../pages";

export const WorkflowEditorRoute: React.FC = () => {
  return (
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route
          index
          element={
            <AuthorizationRoute requireWorkspace>
              <WorkflowsEditorPage />
            </AuthorizationRoute>
          }
        />
      </Route>
    </Routes>
  );
};
