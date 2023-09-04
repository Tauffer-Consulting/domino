import React, { useCallback } from "react";
import localForage from "services/config/local-forage.config";
import { createCustomContext } from "utils";

import { type IWorkflowSettings } from "../types/settings";

export interface IWorkflowSettingsContext {
  fetchWorkflowSettingsData: () => Promise<IWorkflowSettings>;
  setWorkflowSettingsData: (data: any) => Promise<void>;
  clearWorkflowSettingsData: () => Promise<void>;
}

export const [WorkflowSettingsDataContext, useWorkflowSettings] =
  createCustomContext<IWorkflowSettingsContext>("WorkflowSettingsContext");

const WorkflowSettingsDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Forage forms data
  const fetchWorkflowSettingsData = useCallback(async () => {
    const data = await localForage.getItem<any>("workflowSettingsData");
    if (data === null) {
      return {};
    }
    return data;
  }, []);

  const setWorkflowSettingsData = useCallback(async (data: any) => {
    await localForage.setItem("workflowSettingsData", data);
  }, []);

  const clearWorkflowSettingsData = useCallback(async () => {
    await localForage.setItem("workflowSettingsData", {});
  }, []);

  const value = {
    fetchWorkflowSettingsData,
    setWorkflowSettingsData,
    clearWorkflowSettingsData,
  };

  return (
    <WorkflowSettingsDataContext.Provider value={value}>
      {children}
    </WorkflowSettingsDataContext.Provider>
  );
};

export default WorkflowSettingsDataProvider;
