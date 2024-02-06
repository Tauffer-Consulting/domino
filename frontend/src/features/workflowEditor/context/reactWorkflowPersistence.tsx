import { useStorage } from "@nathan-vm/use-storage";
import { type IWorkflowElement } from "features/myWorkflows/types";
import React, { useCallback } from "react";
import { type Node, type Edge } from "reactflow";
import { createCustomContext } from "utils";

export interface IReactWorkflowPersistenceContext {
  setWorkflowEdges: (edges: Edge[]) => void;
  setWorkflowNodes: (edges: Node[]) => void;
  fetchForageWorkflowEdges: () => Edge[];
  fetchForageWorkflowNodes: () => IWorkflowElement[];
  clearReactWorkflowPersistence: () => void;
}

export const [ReactWorkflowPersistenceContext, useReactWorkflowPersistence] =
  createCustomContext<IReactWorkflowPersistenceContext>(
    "ReactWorkflowPersistence Context",
  );

const ReactWorkflowPersistenceProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const localStorage = useStorage();

  const setWorkflowEdges = useCallback((edges: Edge[]) => {
    localStorage.setItem("workflowEdges", edges);
  }, []);
  const setWorkflowNodes = useCallback((nodes: Node[]) => {
    localStorage.setItem("workflowNodes", nodes);
  }, []);

  const fetchForageWorkflowEdges = useCallback(() => {
    let workflowEdges = localStorage.getItem<any>("workflowEdges");
    if (!workflowEdges || workflowEdges.length === 0) {
      workflowEdges = [];
    }
    return workflowEdges;
  }, []);
  const fetchForageWorkflowNodes = useCallback(() => {
    let workflowEdges = localStorage.getItem<any>("workflowNodes");
    if (!workflowEdges || workflowEdges.length === 0) {
      workflowEdges = [];
    }
    return workflowEdges;
  }, []);

  const clearReactWorkflowPersistence = useCallback(() => {
    localStorage.setItem("workflowEdges", []);
    localStorage.setItem("workflowNodes", []);
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
