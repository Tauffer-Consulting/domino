import { CircularProgress } from "@mui/material";
import {
  WorkspaceSettingsPage,
  WorkspacesPage,
} from "features/workspaces/pages";
import { Suspense, type FC } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { lazyImport } from "utils";

import { PrivateRoute } from "./privateRoute";
import { PublicRoute } from "./publicRoute";

const { SignInPage } = lazyImport(
  async () => await import("features/auth/pages/signIn/signInPage"),
  "SignInPage",
);
const { SignUpPage } = lazyImport(
  async () => await import("features/auth/pages/signUp/signUpPage"),
  "SignUpPage",
);
const { WorkflowsEditorPage } = lazyImport(
  async () => await import("features/workflowEditor/pages"),
  "WorkflowsEditorPage",
);
const { WorkflowsPage } = lazyImport(
  async () => await import("features/workflows/pages"),
  "WorkflowsPage",
);

/**
 * Application router
 * @todo implement recover password pages
 * @todo implement error (404, ...) pages
 * @todo lazy loading with React.Lazy and Suspense
 * @returns app router component
 */
export const ApplicationRoutes: FC = () => (
  <Suspense
    fallback={
      <div className="h-full w-full flex items-center justify-center">
        <CircularProgress size="xl" />
      </div>
    }
  >
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
  </Suspense>
);

export default ApplicationRoutes;
