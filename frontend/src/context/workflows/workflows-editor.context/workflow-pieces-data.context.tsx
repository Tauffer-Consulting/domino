import React, { useCallback } from "react";
import localForage from "services/config/local-forage.config";
import { createCustomContext } from "utils";
import { IWorkflowPieceData } from "../types";

type ForagePiecesData = Record<string,IWorkflowPieceData>

export interface IWorkflowPiecesDataContext {
  setForageWorkflowPiecesData: (id:string,pieceData: IWorkflowPieceData) => Promise<void>
  fetchForageWorkflowPiecesData: ()=> Promise<ForagePiecesData>
  fetchForageWorkflowPiecesDataById: (id:string)=> Promise<IWorkflowPieceData | undefined>
  clearForageWorkflowPiecesData: ()=> Promise<void>
}

export const [WorkflowPiecesDataContext, useWorkflowPiecesData] =
  createCustomContext<IWorkflowPiecesDataContext>('WorkflowPiecesData Context')

const WorkflowPiecesDataProvider: React.FC<{children:React.ReactNode}> = ({ children }) => {
  
  const setForageWorkflowPiecesData = useCallback(async ( id:string,pieceData: IWorkflowPieceData) => {
    let currentData = await localForage.getItem<ForagePiecesData>('workflowPiecesData')
    if (!currentData) {
      currentData = {}
    }
    currentData[id] = pieceData
    await localForage.setItem('workflowPiecesData', currentData)
  }, [])

  const fetchForageWorkflowPiecesData = useCallback(async () => {
    let workflowPiecesData = await localForage.getItem<ForagePiecesData>("workflowPiecesData")
    
    return workflowPiecesData ?? {}
  }, [])

  const fetchForageWorkflowPiecesDataById = useCallback(async (id:string) => {
    let workflowPiecesData = await localForage.getItem<ForagePiecesData>("workflowPiecesData")
    
    if(!workflowPiecesData?.[id]){
      return
    }

    return workflowPiecesData[id]
  }, [])

  const clearForageWorkflowPiecesData = useCallback(async()=>{
    await localForage.setItem('workflowPiecesData', {})
  },[])

  const value: IWorkflowPiecesDataContext = {
    setForageWorkflowPiecesData,
    fetchForageWorkflowPiecesData,
    fetchForageWorkflowPiecesDataById,
    clearForageWorkflowPiecesData
  }

  return (
    <WorkflowPiecesDataContext.Provider value={value}>
      {children}
    </WorkflowPiecesDataContext.Provider>
  )
}

export default WorkflowPiecesDataProvider