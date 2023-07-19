import React, { FC, useCallback } from 'react'

import {
  IPostWorkflowParams,
  useAuthenticatedPostWorkflow,
  IPostWorkflowResponseInterface
} from 'services/requests/workflow'

import { useWorkspaces } from 'context/workspaces/workspaces.context';

import { createCustomContext } from 'utils'

import { useFormsData, IFormsDataContext } from './forms-data.context';
import { usesPieces, IPiecesContext } from './pieces.context';
import { useWorkflowsEdges, IWorkflowsEdgesContext } from './workflow-edges.context';
import { useWorkflowsNodes, IWorkflowsNodesContext } from './workflow-nodes.context';
import { useWorkflowPiece, IWorkflowPieceContext } from './workflow-pieces.context';
import { useWorkflowPiecesData, IWorkflowPiecesDataContext } from './workflow-pieces-data.context';
import { IWorkflowSettingsContext, useWorkflowSettings } from './workflow-settings-data.context';

interface IWorkflowsEditorContext extends IFormsDataContext, IPiecesContext, IWorkflowsEdgesContext, IWorkflowSettingsContext, IWorkflowsNodesContext, IWorkflowPieceContext, IWorkflowPiecesDataContext {

  workflowsEditorBodyFromFlowchart: () => any // TODO add type
  handleCreateWorkflow: (params: IPostWorkflowParams) => Promise<IPostWorkflowResponseInterface>
  clearForageData: () => Promise<void>
}

export const [WorkflowsEditorContext, useWorkflowsEditor] =
  createCustomContext<IWorkflowsEditorContext>('WorkflowsEditor Context')

export const WorkflowsEditorProvider: FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { workspace } = useWorkspaces()
  const postWorkflow = useAuthenticatedPostWorkflow()

  const {
    fetchFormsForageData,
    fetchForageDataById,
    setFormsForageData,
    removeFormsForageDataById,
    removeFormsForageDataNotInIds,
    getForageCheckboxStates,
    setForageCheckboxStates,
    clearForageCheckboxStates,
    clearForageFormsData,
  } = useFormsData()

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


  const workflowsEditorBodyFromFlowchart = useCallback(async () => {

    const uiSchema: any = {
      nodes: {},
      edges: []
    }

    const settingsData = await fetchFormsForageData()
    const workflowPiecesData = await fetchForageWorkflowPiecesData()

    console.log('settingsData', settingsData)

    return {}
  }, [fetchForageWorkflowPiecesData, fetchFormsForageData])

  // const workflowsEditorBodyFromFlowchart = useCallback(async () => {

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
  // taskDict['task_id'] = taskName
  // taskDict['piece'] = {
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
  //       const taskDict: any = {}

  //       const { storageSource, baseFolder, ...providerOptions } = storageWorkflowData || {}
  //       const storageDict: any = {
  //         "source": storageSource || null,
  //         "base_folder": baseFolder || null,
  //         "mode": elementData?.storage?.storageAccessMode,
  //         "provider_options": providerOptions || null
  //       }
  //       taskDict['workflow_shared_storage'] = storageDict

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
  //       taskDict['container_resources'] = containerResources

  //       const nodeId = element.id
  //       taskDict['task_id'] = taskName
  //       taskDict['piece'] = {
  //         id: parseInt(nodeId.split('_')[0]),
  //         name: element.data.name
  //       }
  //       const pieceInputKwargs: any = {}
  //       if (nodeId in upstreamMap) {
  //         for (const key in upstreamMap[nodeId]) {
  //           const value = upstreamMap[nodeId][key]
  //           const fromUpstream = value['fromUpstream']
  //           pieceInputKwargs[key] = {
  //             fromUpstream: fromUpstream,
  //             upstreamTaskId: fromUpstream ? nodeId2taskName[value['upstreamId']] : null,
  //             upstreamArgument: fromUpstream ? value['upstreamArgument'] : null,
  //             value: value['value']
  //           }
  //         }
  //       }
  //       //console.log(pieceInputKwargs)

  //       taskDict['piece_input_kwargs'] = pieceInputKwargs

  //       tasks_dict[taskName] = taskDict
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
    await clearForageFormsData()

    await clearForageCheckboxStates()

    await clearForageWorkflowPieces()
    await clearForageWorkflowPiecesData()
  }, [clearForageCheckboxStates, clearForageWorkflowPieces, clearForageFormsData, clearForageWorkflowPiecesData])

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
    setFormsForageData,
    fetchForageDataById,
    removeFormsForageDataById,
    removeFormsForageDataNotInIds,
    handleCreateWorkflow,
    fetchForageWorkflowEdges,
    fetchForageWorkflowNodes,
    workflowsEditorBodyFromFlowchart,

    nodeDirection,
    setForageCheckboxStates,
    getForageCheckboxStates,
    setForageWorkflowPieces,
    getForageWorkflowPieces,
    removeForageWorkflowPiecesById,
    fetchWorkflowPieceById,

    toggleNodeDirection,
    fetchFormsForageData,

    fetchForageWorkflowPiecesData,
    fetchForageWorkflowPiecesDataById,
    setForageWorkflowPiecesData,

    clearForageData,
    clearForageWorkflowPiecesData,
    clearForageFormsData,
    clearForageCheckboxStates,
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
