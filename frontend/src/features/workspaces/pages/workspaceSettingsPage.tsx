import React from "react";

import WorkspaceSettingsComponent from "../components/workspaceSettings";
import { WorkspaceSettingsProvider } from "../context/workspaceSettings";

export const WorkspaceSettingsPage: React.FC = () => {
  return (
    <WorkspaceSettingsProvider>
      <WorkspaceSettingsComponent />
    </WorkspaceSettingsProvider>
  );
};
