import React, { FC, useCallback } from 'react'

import {
  IPostWorkflowParams,
  useAuthenticatedPostWorkflow,
  IPostWorkflowResponseInterface,
} from 'services/requests/workflow'

import { useWorkspaces } from 'context/workspaces/workspaces.context';

import { createCustomContext, generateTaskName, getIdSlice } from 'utils'

import { usesPieces, IPiecesContext } from './pieces.context';
import { useWorkflowsEdges, IWorkflowsEdgesContext } from './workflow-edges.context';
import { useWorkflowsNodes, IWorkflowsNodesContext } from './workflow-nodes.context';
import { useWorkflowPiece, IWorkflowPieceContext } from './workflow-pieces.context';
import { useWorkflowPiecesData, IWorkflowPiecesDataContext } from './workflow-pieces-data.context';
import { IWorkflowSettingsContext, useWorkflowSettings } from './workflow-settings-data.context';
import { CreateWorkflowRequest, TasksDataModel } from '../types';

interface IWorkflowsEditorContext extends IPiecesContext, IWorkflowsEdgesContext, IWorkflowSettingsContext, IWorkflowsNodesContext, IWorkflowPieceContext, IWorkflowPiecesDataContext {

  fetchWorkflowForage: () => any // TODO add type
  workflowsEditorBodyFromFlowchart: () => Promise<CreateWorkflowRequest> // TODO add type
  handleCreateWorkflow: (params: IPostWorkflowParams) => Promise<IPostWorkflowResponseInterface>
  clearForageData: () => Promise<void>
}

export const [WorkflowsEditorContext, useWorkflowsEditor] =
  createCustomContext<IWorkflowsEditorContext>('WorkflowsEditor Context')

export const WorkflowsEditorProvider: FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { workspace } = useWorkspaces()
  const postWorkflow = useAuthenticatedPostWorkflow()

  const {
    repositories,
    repositoriesError,
    repositoriesLoading,
    repositoryOperators,
    fetchForagePieceById,
    fetchRepoById,
    search,
    handleSearch,
  } = usesPieces()

  const {
    edges,
    fetchForageWorkflowEdges,
    setEdges,
  } = useWorkflowsEdges()

  const {
    nodes,
    nodeDirection,
    fetchForageWorkflowNodes,
    setNodes,
    toggleNodeDirection,
  } = useWorkflowsNodes()

  const {
    setForageWorkflowPieces,
    setForageWorkflowPiecesOutputSchema,
    fetchWorkflowPieceById,
    getForageWorkflowPieces,
    removeForageWorkflowPiecesById,
    clearForageWorkflowPieces,
  } = useWorkflowPiece()

  const {
    fetchForageWorkflowPiecesData,
    fetchForageWorkflowPiecesDataById,
    setForageWorkflowPiecesData,
    clearForageWorkflowPiecesData,
    removeForageWorkflowPieceDataById,
    clearDownstreamDataById,
  } = useWorkflowPiecesData()


  const {
    fetchWorkflowSettingsData,
    setWorkflowSettingsData,
    clearWorkflowSettingsData
  } = useWorkflowSettings()


  const handleCreateWorkflow = useCallback(async (payload: IPostWorkflowParams) => {
    return postWorkflow({ ...payload, workspace_id: workspace?.id ?? '' })
  }, [postWorkflow, workspace])


  const fetchWorkflowForage = useCallback(async () => {
    const workflowPieces = await getForageWorkflowPieces()
    const workflowPiecesData = await fetchForageWorkflowPiecesData()
    const workflowSettingsData = await fetchWorkflowSettingsData()

    return {
      workflowPieces,
      workflowPiecesData,
      workflowSettingsData,
    }
  }, [fetchForageWorkflowPiecesData, fetchWorkflowSettingsData, getForageWorkflowPieces])

  const workflowsEditorBodyFromFlowchart = useCallback(async () => {
    const workflowPiecesData = await fetchForageWorkflowPiecesData()
    const workflowSettingsData = await fetchWorkflowSettingsData()
    const workflowNodes = await fetchForageWorkflowNodes()
    const workflowEdges = await fetchForageWorkflowEdges()


    const workflow: CreateWorkflowRequest['workflow'] = {
      name: workflowSettingsData.config.name,
      schedule_interval: workflowSettingsData.config.scheduleInterval,
      select_end_date: workflowSettingsData.config.endDateType,
      start_date: workflowSettingsData.config.startDate,
      end_date: workflowSettingsData.config.endDate,
    }

    const ui_schema: CreateWorkflowRequest['ui_schema'] = {
      nodes: {},
      edges: workflowEdges
    }

    const tasks: CreateWorkflowRequest['tasks'] = {}

    for (const element of workflowNodes) {
      const elementData = workflowPiecesData[element.id]

      const numberId = getIdSlice(element.id)
      const taskName = generateTaskName(element.data.name, element.id)

      ui_schema['nodes'][taskName] = element

      const dependencies = workflowEdges.reduce<string[]>((acc, edge) => {
        if (edge.target === element.id) {
          const task = workflowNodes.find(n => n.id === edge.source)
          if (task) {
            const upTaskName = generateTaskName(task.data.name,task.id)
            acc.push(upTaskName)
          }
        }

        return acc
      }, [])

      const { storageSource, baseFolder, ...providerOptions } = workflowSettingsData.storage || {}

      const pieceInputKwargs = Object.entries(elementData.inputs).reduce((acc, [key, value]) => {
        if(Array.isArray(value.value)) {
          acc[key] = {
            fromUpstream: value.fromUpstream,
            upstreamTaskId: value.fromUpstream ? value.upstreamId : null,
            upstreamArgument: value.fromUpstream ? value.upstreamArgument : null,
            value: value.value.map((value) => {
              return {
                fromUpstream: value.fromUpstream,
                upstreamTaskId: value.fromUpstream ? value.upstreamId : null,
                upstreamArgument: value.fromUpstream ? value.upstreamArgument : null,
                value: value.value
              }
            })
          }

          return acc
        }

        acc[key] = {
          fromUpstream: value.fromUpstream,
          upstreamTaskId: value.fromUpstream ? value.upstreamId : null,
          upstreamArgument: value.fromUpstream ? value.upstreamArgument : null,
          value: value.value
        }

        return acc
      }, {} as Record<string, any>)

      const taskDataModel: TasksDataModel = {
        task_id: taskName,
        piece: {
          id: numberId,
          name: element.data.name
        },
        dependencies,
        piece_input_kwargs: pieceInputKwargs,
        workflow_shared_storage: {
          source: storageSource,
          base_folder: baseFolder,
          mode: elementData?.storage?.storageAccessMode,
          provider_options: providerOptions,
        },
        container_resources: {
          requests: {
            cpu: elementData.containerResources.cpu.min,
            memory: elementData.containerResources.memory.min
          },
          limits: {
            cpu: elementData.containerResources.cpu.max,
            memory: elementData.containerResources.memory.max
          },
          use_gpu: elementData.containerResources.useGpu
        },
      }

      tasks[taskName] = taskDataModel
    }



    return {
      workflow,
      tasks,
      ui_schema,
    }

  }, [fetchForageWorkflowEdges, fetchForageWorkflowNodes, fetchForageWorkflowPiecesData, fetchWorkflowSettingsData])

  const clearForageData = useCallback(async () => {
    await Promise.allSettled([
      clearForageWorkflowPieces(),
      clearForageWorkflowPiecesData(),
      clearWorkflowSettingsData(),
    ])
  }, [clearForageWorkflowPieces, clearForageWorkflowPiecesData, clearWorkflowSettingsData])

  const value: IWorkflowsEditorContext = {
    repositories,
    repositoriesError: !!repositoriesError,
    repositoriesLoading,
    repositoryOperators,
    search,
    edges,
    setEdges,
    nodes,
    setNodes,
    handleSearch,
    fetchRepoById,
    fetchForagePieceById,
    handleCreateWorkflow,
    fetchForageWorkflowEdges,
    fetchForageWorkflowNodes,
    fetchWorkflowForage,
    workflowsEditorBodyFromFlowchart,

    nodeDirection,
    setForageWorkflowPieces,
    getForageWorkflowPieces,
    removeForageWorkflowPiecesById,
    removeForageWorkflowPieceDataById,
    fetchWorkflowPieceById,

    toggleNodeDirection,

    fetchForageWorkflowPiecesData,
    fetchForageWorkflowPiecesDataById,
    setForageWorkflowPiecesData,
    setForageWorkflowPiecesOutputSchema,

    clearForageData,
    clearDownstreamDataById,
    clearForageWorkflowPiecesData,
    clearForageWorkflowPieces,
    fetchWorkflowSettingsData,
    setWorkflowSettingsData,
    clearWorkflowSettingsData
  }

  return (
    <WorkflowsEditorContext.Provider value={value}>
      {children}
    </WorkflowsEditorContext.Provider>
  )
}

