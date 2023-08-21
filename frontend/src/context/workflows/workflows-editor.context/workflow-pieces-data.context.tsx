import React, { useCallback } from "react";
import localForage from "services/config/local-forage.config";
import { createCustomContext } from "utils";
import { IWorkflowPieceData } from "../types";

type ForagePiecesData = Record<string, IWorkflowPieceData>

export interface IWorkflowPiecesDataContext {
  setForageWorkflowPiecesData: (id: string, pieceData: IWorkflowPieceData) => Promise<void>
  fetchForageWorkflowPiecesData: () => Promise<ForagePiecesData>
  fetchForageWorkflowPiecesDataById: (id: string) => Promise<IWorkflowPieceData | undefined>
  removeForageWorkflowPieceDataById: (id: string) => Promise<void>
  clearForageWorkflowPiecesData: () => Promise<void>
}

export const [WorkflowPiecesDataContext, useWorkflowPiecesData] =
  createCustomContext<IWorkflowPiecesDataContext>('WorkflowPiecesData Context')

const WorkflowPiecesDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const setForageWorkflowPiecesData = useCallback(async (id: string, pieceData: IWorkflowPieceData) => {
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

  const fetchForageWorkflowPiecesDataById = useCallback(async (id: string) => {
    let workflowPiecesData = await localForage.getItem<ForagePiecesData>("workflowPiecesData")

    if (!workflowPiecesData?.[id]) {
      return
    }

    return workflowPiecesData[id]
  }, [])

  const removeForageWorkflowPieceDataById = useCallback(async (id: string) => {
    let workflowPieceData = await localForage.getItem<ForagePiecesData>("workflowPiecesData")

    if (!workflowPieceData) {
      return
    }
    delete workflowPieceData[id]

    Object.values(workflowPieceData).forEach(wpd => {
      Object.values(wpd.inputs).forEach(input => {
        if (input.upstreamId === id) {
          input.fromUpstream = false
          input.upstreamArgument = ""
          input.upstreamId = ""
          input.upstreamValue = ""
        } else if (Array.isArray(input.value)) {
          input.value.forEach(item => {
            if (item.upstreamId === id) {
              item.fromUpstream = false
              item.upstreamArgument = ""
              item.upstreamId = ""
              item.upstreamValue = ""
            } else if (typeof item.upstreamId === "object") {
              Object.keys(item.upstreamId).forEach(key => {
                const obj = item as any
                if (obj.upstreamId[key] === id) {
                  obj.fromUpstream[key] = false
                  obj.upstreamArgument[key] = ""
                  obj.upstreamId[key] = ""
                  obj.upstreamValue[key] = ""
                }
              })
            }
          })
        }
      })
    })

    await localForage.setItem('workflowPiecesData', workflowPieceData)
  }, [])

  const clearForageWorkflowPiecesData = useCallback(async () => {
    await localForage.setItem('workflowPiecesData', {})
  }, [])

  const value: IWorkflowPiecesDataContext = {
    setForageWorkflowPiecesData,
    fetchForageWorkflowPiecesData,
    fetchForageWorkflowPiecesDataById,
    removeForageWorkflowPieceDataById,
    clearForageWorkflowPiecesData
  }

  return (
    <WorkflowPiecesDataContext.Provider value={value}>
      {children}
    </WorkflowPiecesDataContext.Provider>
  )
}

export default WorkflowPiecesDataProvider
