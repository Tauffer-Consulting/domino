import { useState } from "react";
import { createCustomContext } from "utils";

import { type IWorkflow } from "../types";

// import { type IWorkflowProvider } from "./types";

export const [WorkflowContext, useWorkflowContext] =
  createCustomContext("Workflow Context");

export const WorkflowProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [workflow, _setWorkflow] = useState<IWorkflow | null>(
    localStorage.getItem("workspace")
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (JSON.parse(localStorage.getItem("workspace")!) as IWorkflow)
      : null,
  );

  const value = {
    workflow,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};
