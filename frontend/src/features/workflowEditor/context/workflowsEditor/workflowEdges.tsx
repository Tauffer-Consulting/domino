import React, { useCallback, useEffect, useState } from "react";
import { type Edge } from "reactflow";
import localForage from "services/config/localForage.config";
import { createCustomContext } from "utils";

export interface IWorkflowsEdgesContext {
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  fetchForageWorkflowEdges: () => Promise<Edge[]>;
}

export const [WorkflowsEdgesContext, useWorkflowsEdges] =
  createCustomContext<IWorkflowsEdgesContext>("WorkflowsEdges Context");

const WorkflowsEdgesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loadingEdges, setLoadingEdges] = useState<boolean>(true);

  const setForageWorkflowEdges = useCallback(async (edges: Edge[]) => {
    await localForage.setItem("workflowEdges", edges);
  }, []);

  const fetchForageWorkflowEdges = useCallback(async () => {
    let workflowEdges = await localForage.getItem<any>("workflowEdges");
    if (!workflowEdges || workflowEdges.length === 0) {
      workflowEdges = [];
    }
    return workflowEdges;
  }, []);

  useEffect(() => {
    void (async () => {
      const forageEdges = await fetchForageWorkflowEdges();
      await setForageWorkflowEdges(forageEdges);
      setLoadingEdges(false);
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      if (loadingEdges) {
        return;
      }
      await setForageWorkflowEdges(edges);
    })();
  }, [edges, setForageWorkflowEdges, loadingEdges]);

  const value: IWorkflowsEdgesContext = {
    edges,
    fetchForageWorkflowEdges: async () => await fetchForageWorkflowEdges(),
    setEdges,
  };

  return (
    <WorkflowsEdgesContext.Provider value={value}>
      {children}
    </WorkflowsEdgesContext.Provider>
  );
};

export default WorkflowsEdgesProvider;
