import { useStorage } from "@nathan-vm/use-storage";
import React, { useCallback } from "react";
import { createCustomContext } from "utils";

export interface IWorkflowPieceContext {
  setForageWorkflowPieces: (workflowPieces: any) => void; // TODO add type
  getForageWorkflowPieces: () => Record<string, Piece>; // TODO add type
  removeForageWorkflowPiecesById: (id: string) => void;
  fetchWorkflowPieceById: (id: string) => Piece; // TODO add type
  clearForageWorkflowPieces: () => void;
  setForageWorkflowPiecesOutputSchema: (id: string, properties: any) => void;
}

export const [WorkflowPiecesContext, useWorkflowPiece] =
  createCustomContext<IWorkflowPieceContext>("WorkflowsPieces Context");

const WorkflowPiecesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const localStorage = useStorage();

  const setForageWorkflowPieces = useCallback((workflowPieces: any) => {
    localStorage.setItem("workflowPieces", workflowPieces);
  }, []);

  const setForageWorkflowPiecesOutputSchema = useCallback(
    (id: any, properties: any) => {
      const workflowPieces = localStorage.getItem<any>("workflowPieces");
      if (workflowPieces?.[id]) {
        workflowPieces[id].output_schema.properties = properties;
        localStorage.setItem("workflowPieces", workflowPieces);
      }
    },
    [],
  );

  const clearForageWorkflowPieces = useCallback(() => {
    localStorage.setItem("workflowPieces", {});
  }, []);

  const getForageWorkflowPieces = useCallback(() => {
    const workflowPieces = localStorage.getItem<any>("workflowPieces");
    if (!workflowPieces) {
      return {};
    }
    return workflowPieces;
  }, []);

  const removeForageWorkflowPiecesById = useCallback((id: string) => {
    const workflowPieces = localStorage.getItem<any>("workflowPieces");
    if (!workflowPieces) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete workflowPieces[id];
    localStorage.setItem("workflowPieces", workflowPieces);
  }, []);

  const fetchWorkflowPieceById = useCallback((id: string) => {
    const workflowPieces = localStorage.getItem<any>("workflowPieces");
    if (workflowPieces !== null) {
      return workflowPieces[id];
    }
  }, []);

  const value: IWorkflowPieceContext = {
    fetchWorkflowPieceById,
    getForageWorkflowPieces,
    removeForageWorkflowPiecesById,
    setForageWorkflowPieces,
    clearForageWorkflowPieces,
    setForageWorkflowPiecesOutputSchema,
  };

  return (
    <WorkflowPiecesContext.Provider value={value}>
      {children}
    </WorkflowPiecesContext.Provider>
  );
};

export default WorkflowPiecesProvider;
