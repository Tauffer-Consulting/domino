import React, { useCallback } from 'react';
import localForage from 'services/config/local-forage.config';
import { IOperator } from 'services/requests/piece';
import { createCustomContext } from 'utils';

export interface IWorkflowPieceContext {
  setForageWorkflowPieces: (workflowPieces: any) => Promise<void> // TODO add type
  getForageWorkflowPieces: () => Promise<any> // TODO add type
  removeForageWorkflowPiecesById: (id: string) => Promise<void>
  fetchWorkflowPieceById: (id: string) => Promise<IOperator> // TODO add type
  clearForageWorkflowPieces: () => Promise<void>
}

export const [WorkflowPiecesContext, useWorkflowPiece] =
  createCustomContext<IWorkflowPieceContext>('WorkflowsPieces Context')

const WorkflowPiecesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const setForageWorkflowPieces = useCallback(async (workflowPieces: any) => {
    await localForage.setItem('workflowPieces', workflowPieces)
  }, [])

  const clearForageWorkflowPieces = useCallback(async () => {
    await localForage.setItem('workflowPieces', {})
  }, [])

  const getForageWorkflowPieces = useCallback(async () => {
    const workflowPieces = await localForage.getItem<any>("workflowPieces")
    if (!workflowPieces) {
      return {}
    }
    return workflowPieces
  }, [])

  const removeForageWorkflowPiecesById = useCallback(async (id: string) => {
    const workflowPieces = await localForage.getItem<any>("workflowPieces")
    if (!workflowPieces) {
      return
    }
    delete workflowPieces[id]
    await localForage.setItem('workflowPieces', workflowPieces)
  }, [])

  const fetchWorkflowPieceById = useCallback(async (id: string) => {
    const workflowPieces = await localForage.getItem<any>("workflowPieces")
    if (workflowPieces !== null) {
      return workflowPieces[id]
    }
  }, [])

  const value: IWorkflowPieceContext = {
    fetchWorkflowPieceById,
    getForageWorkflowPieces,
    removeForageWorkflowPiecesById,
    setForageWorkflowPieces,
    clearForageWorkflowPieces,
  }

  return (
    <WorkflowPiecesContext.Provider value={value}>
      {children}
    </WorkflowPiecesContext.Provider>
  );
}

export default WorkflowPiecesProvider;