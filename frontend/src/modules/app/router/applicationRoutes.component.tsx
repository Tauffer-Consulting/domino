import { WorkflowsEditorPage, WorkflowsPage } from "pages/private/workflows/";
import {
  WorkspacesPage,
  WorkspaceSettingsPage,
} from "pages/private/workspaces";
import SignInPage from "pages/public/signIn/signInPage.component";
import SignUpPage from "pages/public/signUp/signUpPage.component";
import { type FC } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { PrivateRoute } from "./privateRoute.component";
import { PublicRoute } from "./publicRoute.component";

/**
 * Application router
 * @todo implement recover password pages
 * @todo implement error (404, ...) pages
 * @todo lazy loading with React.Lazy and Suspense
 * @returns app router component
 */
export const ApplicationRoutes: FC = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/workspaces" replace />} />

    <Route
      path="/sign-in"
      element={<PublicRoute publicOnly component={SignInPage} />}
    />

    <Route
      path="/sign-up"
      element={<PublicRoute publicOnly component={SignUpPage} />}
    />

    {/** @todo implement page */}
    <Route
      path="/recover-password"
      element={
        <PublicRoute publicOnly component={() => <h1>Recover password</h1>} />
      }
    />

    <Route
      path="/workspaces"
      element={<PrivateRoute component={WorkspacesPage} />}
    />

    <Route
      path="/workspace-settings"
      element={
        <PrivateRoute requireWorkspace component={WorkspaceSettingsPage} />
      }
    />

    <Route
      path="/workflows"
      element={<PrivateRoute requireWorkspace component={WorkflowsPage} />}
    />

    <Route
      path="/workflows-editor"
      element={
        <PrivateRoute requireWorkspace component={WorkflowsEditorPage} />
      }
    />

    {/** @todo implement page */}
    <Route
      path="/404"
      element={
        <PublicRoute publicOnly component={() => <h1>404 not found</h1>} />
      }
    />

    <Route path="*" element={<Navigate to="/404" />} />
  </Routes>
);

export default ApplicationRoutes;
