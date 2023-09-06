import React, { useCallback } from "react";
import localForage from "services/config/localForage.config";
import { createCustomContext } from "utils";

export interface IWorkflowPieceContext {
  setForageWorkflowPieces: (workflowPieces: any) => Promise<void>; // TODO add type
  getForageWorkflowPieces: () => Promise<Record<string, Piece>>; // TODO add type
  removeForageWorkflowPiecesById: (id: string) => Promise<void>;
  fetchWorkflowPieceById: (id: string) => Promise<Piece>; // TODO add type
  clearForageWorkflowPieces: () => Promise<void>;
  setForageWorkflowPiecesOutputSchema: (
    id: string,
    properties: any,
  ) => Promise<void>;
}

export const [WorkflowPiecesContext, useWorkflowPiece] =
  createCustomContext<IWorkflowPieceContext>("WorkflowsPieces Context");

const WorkflowPiecesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const setForageWorkflowPieces = useCallback(async (workflowPieces: any) => {
    await localForage.setItem("workflowPieces", workflowPieces);
  }, []);

  const setForageWorkflowPiecesOutputSchema = useCallback(
    async (id: any, properties: any) => {
      const workflowPieces = await localForage.getItem<any>("workflowPieces");
      if (workflowPieces?.[id]) {
        workflowPieces[id].output_schema.properties = properties;
        void localForage.setItem("workflowPieces", workflowPieces);
      }
    },
    [],
  );

  const clearForageWorkflowPieces = useCallback(async () => {
    await localForage.setItem("workflowPieces", {});
  }, []);

  const getForageWorkflowPieces = useCallback(async () => {
    const workflowPieces = await localForage.getItem<any>("workflowPieces");
    if (!workflowPieces) {
      return {};
    }
    return workflowPieces;
  }, []);

  const removeForageWorkflowPiecesById = useCallback(async (id: string) => {
    const workflowPieces = await localForage.getItem<any>("workflowPieces");
    if (!workflowPieces) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete workflowPieces[id];
    await localForage.setItem("workflowPieces", workflowPieces);
  }, []);

  const fetchWorkflowPieceById = useCallback(async (id: string) => {
    const workflowPieces = await localForage.getItem<any>("workflowPieces");
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
