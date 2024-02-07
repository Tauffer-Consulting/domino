import { useStorage } from "@nathan-vm/use-storage";
import React, { useCallback } from "react";
import { createCustomContext } from "utils";

import { type IWorkflowSettings } from "./types";

export interface IWorkflowSettingsContext {
  getWorkflowSettingsData: () => IWorkflowSettings;
  setWorkflowSettingsData: (data: IWorkflowSettings) => void;
  clearWorkflowSettingsData: () => void;
}

export const [WorkflowSettingsDataContext, useWorkflowSettings] =
  createCustomContext<IWorkflowSettingsContext>("WorkflowSettingsContext");

const WorkflowSettingsDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const localStorage = useStorage();

  const getWorkflowSettingsData = useCallback(() => {
    return (
      localStorage.getItem<IWorkflowSettings>("workflowSettingsData") ??
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      ({} as IWorkflowSettings)
    );
  }, []);

  const setWorkflowSettingsData = useCallback((data: IWorkflowSettings) => {
    localStorage.setItem("workflowSettingsData", data);
  }, []);

  const clearWorkflowSettingsData = useCallback(() => {
    localStorage.removeItem("workflowSettingsData");
  }, []);

  const value = {
    getWorkflowSettingsData,
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
