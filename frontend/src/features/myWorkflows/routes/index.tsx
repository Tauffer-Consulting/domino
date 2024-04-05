import { AuthorizationRoute, PrivateRoute } from "@components/Routes";
import React from "react";
import { Route, Routes } from "react-router-dom";

import { ResultsReportPage, WorkflowDetailPage, WorkflowsPage } from "../pages";

export const MyWorkflowsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route
          index
          element={
            <AuthorizationRoute requireWorkspace>
              <WorkflowsPage />
            </AuthorizationRoute>
          }
        />
        <Route
          path=":id"
          element={
            <AuthorizationRoute requireWorkspace>
              <WorkflowDetailPage />
            </AuthorizationRoute>
          }
        />
        <Route
          path=":id/report/:runId"
          element={
            <AuthorizationRoute requireWorkspace>
              <ResultsReportPage />
            </AuthorizationRoute>
          }
        />
      </Route>
    </Routes>
  );
};
