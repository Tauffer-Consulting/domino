import React, { FC, useCallback } from 'react'

import {
  IPostWorkflowParams,
  useAuthenticatedPostWorkflow,
  IPostWorkflowResponseInterface,
  IWorkflowElement
} from 'services/requests/workflow'

import { useWorkspaces } from 'context/workspaces/workspaces.context';

import { createCustomContext, getIdSlice, getUuidSlice } from 'utils'

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
    fetchWorkflowPieceById,
    setForageWorkflowPieces,
    getForageWorkflowPieces,
    removeForageWorkflowPiecesById,
    clearForageWorkflowPieces,
  } = useWorkflowPiece()

  const {
    fetchForageWorkflowPiecesData,
    fetchForageWorkflowPiecesDataById,
    setForageWorkflowPiecesData,
    clearForageWorkflowPiecesData,
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
    /**
     * Gerar o payload do backend
     *
     * workflow
     * tasks
     * ui_schema
     */

    function getTaskName(element: IWorkflowElement) {
      const hashId = getUuidSlice(element.id)
      const taskName = `${element.data.name}_${hashId}`
      return taskName
    }

    const workflowPieces = await getForageWorkflowPieces()
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
      const taskName = getTaskName(element)

      ui_schema['nodes'][taskName] = element

      const dependencies = workflowEdges.reduce<string[]>((acc, edge) => {
        if (edge.target === element.id) {
          const task = workflowNodes.find(n => n.id === edge.source)

          if (task) {
            const upTaskName = getTaskName(task)
            acc.push(upTaskName)
          }
        }

        return acc
      }, [])

      const { storageSource, baseFolder, ...providerOptions } = workflowSettingsData.storage || {}

      const pieceInputKwargs = Object.entries(elementData.inputs).reduce((acc, [key, value]) => {
        acc[key] = {
          fromUpstream: value.fromUpstream,
          upstreamTaskId: value.fromUpstream ? value.upstreamId : null,
          upstreamArgument: value.fromUpstream ? value.upstreamArgument : null,
          value: value.value
        }

        return acc
      }, {} as Record<string, any>)

      console.log("pieceInputKwargs", pieceInputKwargs)

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

  }, [fetchForageWorkflowEdges, fetchForageWorkflowNodes, fetchForageWorkflowPiecesData, fetchWorkflowSettingsData, getForageWorkflowPieces])

  //   const dag_dict: any = {}
  //   const tasks_dict: any = {}
  //   const nodeId2taskName: any = {}
  //   const taskName2nodeId: any = {}

  //   const ui_schema: any = {
  //     "nodes": {},
  //     "edges": []
  //   }

  //   const data = await fetchFormsForageData()
  //   const workflowPiecesData = await fetchForageWorkflowPiecesData()
  //   const upstreamMap = await getForageUpstreamMap()
  //   const nodes = await fetchForageWorkflowNodes()
  //   const edges = await fetchForageWorkflowEdges()

  // const nodeId = element.id
  // taskDataModel['task_id'] = taskName
  // taskDataModel['piece'] = {
  //   id: parseInt(nodeId.split('_')[0]),
  //   name: element.data.name
  // }
  // const pieceInputKwargs: any = {}
  // if (nodeId in workflowPiecesData) {
  //   for (const key in workflowPiecesData[nodeId]) {
  //     pieceInputKwargs[key] = (workflowPiecesData[nodeId]as any)[key]
  //   }
  // }
  //console.log(pieceInputKwargs)

  //   const auxTaskDict: any = {}
  //   for (let index = 0; index < nodes.length; index++) {
  //     let element = nodes[index]
  //     let taskIndex = 0
  //     let taskName = `task_${element.data.name}_${taskIndex}`
  //     while (taskName in auxTaskDict) {
  //       taskIndex += 1
  //       taskName = `task_${element.data.name}_${taskIndex}`
  //     }
  //     auxTaskDict[taskName] = true
  //     nodeId2taskName[element.id] = taskName
  //     taskName2nodeId[taskName] = element.id
  //   }

  //   //var task_index = 1
  //   for (let index = 0; index < nodes.length; index++) {
  //     const element = nodes[index]
  //     const elementData = data[element.id]

  //     try {
  //       var taskIndex = 0
  //       var taskName = `task_${element.data.name}_${taskIndex}`
  //       while (taskName in tasks_dict) {
  //         taskIndex += 1
  //         taskName = `task_${element.data.name}_${taskIndex}`
  //       }
  //       ui_schema['nodes'][taskName] = element
  //       const taskDataModel: any = {}

  //       const { storageSource, baseFolder, ...providerOptions } = storageWorkflowData || {}
  //       const storageDict: any = {
  //         "source": storageSource || null,
  //         "base_folder": baseFolder || null,
  //         "mode": elementData?.storage?.storageAccessMode,
  //         "provider_options": providerOptions || null
  //       }
  //       taskDataModel['workflow_shared_storage'] = storageDict

  //       const containerResources = {
  //         requests: {
  //           cpu: elementData?.containerResources?.cpu.min,
  //           memory: elementData?.containerResources?.memory.min
  //         },
  //         limits: {
  //           cpu: elementData?.containerResources?.cpu.max,
  //           memory: elementData?.containerResources?.memory.max
  //         },
  //         use_gpu: elementData?.containerResources?.useGpu
  //       }
  //       taskDataModel['container_resources'] = containerResources

  //       const nodeId = element.id
  //       taskDataModel['task_id'] = taskName
  //       taskDataModel['piece'] = {
  //         id: parseInt(nodeId.split('_')[0]),
  //         name: element.data.name
  //       }
  //       const pieceInputKwargs: any = {}
  //       if (nodeId in upstreamMap) {
  //         for (const key in upstreamMap[nodeId]) {
  //           const value = upstreamMap[nodeId][key]
  //           const fromUpstream = value['fromUpstream']
  //   pieceInputKwargs[key] = {
  //     fromUpstream: fromUpstream,
  //     upstreamTaskId: fromUpstream ? nodeId2taskName[value['upstreamId']] : null,
  //     upstreamArgument: fromUpstream ? value['upstreamArgument'] : null,
  //     value: value['value']
  //   }
  // }
  //       }
  //       //console.log(pieceInputKwargs)

  //       taskDataModel['piece_input_kwargs'] = pieceInputKwargs

  //       tasks_dict[taskName] = taskDataModel
  //       //task_index += 1
  //     } catch (err) {
  //       console.log('Error', err)
  //     }

  //   }

  //   // Organize dependencies
  //   const dependencies_dict: any = {}
  //   for (let index = 0; index < edges.length; index++) {
  //     const edge: any = edges[index]
  //     const source_task_name = nodeId2taskName[edge.source]
  //     const target_task_name = nodeId2taskName[edge.target]
  //     if (target_task_name in dependencies_dict) {
  //       dependencies_dict[target_task_name].push(source_task_name)
  //     } else {
  //       dependencies_dict[target_task_name] = [source_task_name]
  //     }
  //   }

  //   // Fill in dependencies for each task
  //   const keys = Object.keys(tasks_dict)
  //   keys.forEach((key, index) => {
  //     tasks_dict[key]['dependencies'] = dependencies_dict[key] ? dependencies_dict[key] : []
  //   })
  //   // Finalize dag dictionary
  //   ui_schema['edges'] = edges
  //   dag_dict['tasks'] = tasks_dict
  //   dag_dict['ui_schema'] = ui_schema

  //   return dag_dict
  // }, [fetchFormsForageData, getForageUpstreamMap, fetchForageWorkflowNodes, fetchForageWorkflowEdges])

  const clearForageData = useCallback(async () => {
    // TODO remove old clear methods
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
    fetchWorkflowPieceById,

    toggleNodeDirection,

    fetchForageWorkflowPiecesData,
    fetchForageWorkflowPiecesDataById,
    setForageWorkflowPiecesData,

    clearForageData,
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

