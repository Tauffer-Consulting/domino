import { type IWorkflowElement } from "features/workflows/types";
import React, { useCallback } from "react";
import { type Node, type Edge } from "reactflow";
import localForage from "services/config/localForage.config";
import { createCustomContext } from "utils";

export interface IReactWorkflowPersistenceContext {
  setWorkflowEdges: (edges: Edge[]) => Promise<void>;
  setWorkflowNodes: (edges: Node[]) => Promise<void>;
  fetchForageWorkflowEdges: () => Promise<Edge[]>;
  fetchForageWorkflowNodes: () => Promise<IWorkflowElement[]>;
  clearReactWorkflowPersistence: () => Promise<void>;
}

export const [ReactWorkflowPersistenceContext, useReactWorkflowPersistence] =
  createCustomContext<IReactWorkflowPersistenceContext>(
    "ReactWorkflowPersistence Context",
  );

const ReactWorkflowPersistenceProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const setWorkflowEdges = useCallback(async (edges: Edge[]) => {
    await localForage.setItem("workflowEdges", edges);
  }, []);
  const setWorkflowNodes = useCallback(async (nodes: Node[]) => {
    await localForage.setItem("workflowNodes", nodes);
  }, []);

  const fetchForageWorkflowEdges = useCallback(async () => {
    let workflowEdges = await localForage.getItem<any>("workflowEdges");
    if (!workflowEdges || workflowEdges.length === 0) {
      workflowEdges = [];
    }
    return workflowEdges;
  }, []);
  const fetchForageWorkflowNodes = useCallback(async () => {
    let workflowEdges = await localForage.getItem<any>("workflowNodes");
    if (!workflowEdges || workflowEdges.length === 0) {
      workflowEdges = [];
    }
    return workflowEdges;
  }, []);

  const clearReactWorkflowPersistence = useCallback(async () => {
    await localForage.setItem<any>("workflowEdges", []);
    await localForage.setItem<any>("workflowNodes", []);
  }, []);

  const value: IReactWorkflowPersistenceContext = {
    setWorkflowEdges,
    setWorkflowNodes,
    fetchForageWorkflowEdges,
    fetchForageWorkflowNodes,
    clearReactWorkflowPersistence,
  };

  return (
    <ReactWorkflowPersistenceContext.Provider value={value}>
      {children}
    </ReactWorkflowPersistenceContext.Provider>
  );
};

export default ReactWorkflowPersistenceProvider;
