import Loading from "components/Loading";
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
  async () => await import("features/myWorkflows/pages"),
  "WorkflowsPage",
);
const { WorkflowDetailPage } = lazyImport(
  async () => await import("features/myWorkflows/pages"),
  "WorkflowDetailPage",
);
const { ResultsReportPage } = lazyImport(
  async () => await import("features/myWorkflows/pages"),
  "ResultsReportPage",
);

/**
 * Application router
 * @todo implement recover password pages
 * @todo implement error (404, ...) pages
 * @returns app router component
 */
export const ApplicationRoutes: FC = () => (
  <Suspense
    fallback={
      <div className="h-full w-full flex items-center justify-center">
        <Loading />
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
        path="/my-workflows"
        element={<PrivateRoute requireWorkspace component={WorkflowsPage} />}
      />

      <Route
        path="/my-workflows/:id"
        element={
          <PrivateRoute requireWorkspace component={WorkflowDetailPage} />
        }
      />

      <Route
        path="/my-workflows/:id/report/:runId"
        element={
          <PrivateRoute requireWorkspace component={ResultsReportPage} />
        }
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
