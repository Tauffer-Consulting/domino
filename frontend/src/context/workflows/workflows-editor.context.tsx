import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import * as localForage from 'localforage'
import { toast } from 'react-toastify'
import { Edge } from 'reactflow'

import { workflowFormName } from '../../constants';
import {
  IRepositoryOperators,
  IOperatorForageSchema,
  IGetRepoOperatorsResponseInterface,
  IOperatorRepository,
  useAuthenticatedGetOperatorRepositories,
  IOperator
} from 'services/requests/piece'
import {
  IWorkflowElement,
  IPostWorkflowParams,
  useAuthenticatedPostWorkflow,
  IPostWorkflowResponseInterface
} from 'services/requests/workflow'
import { useFetchAuthenticatedGetRepoIdOperators } from 'services/requests/piece/get-piece-repository-pieces.request'
import { useWorkspaces } from 'context/workspaces/workspaces.context';
import { createCustomContext } from 'utils'


// Config localforage
localForage.config({
  name: 'Domino',
  storeName: 'domino_data', // Should be alphanumeric, with underscores.
  description: 'Domino database'
})

interface IWorkflowsEditorContext {
  repositories: IOperatorRepository[]
  repositoriesError: boolean
  repositoriesLoading: boolean
  repositoryOperators: IRepositoryOperators

  edges: Edge[]
  setEdges: any // todo add type
  nodes: IWorkflowElement[]
  setNodes: any // todo add type

  fetchForageWorkflowEdges: () => Promise<Edge[]>
  fetchForageWorkflowNodes: () => Promise<IWorkflowElement[]>
  handleCreateWorkflow: (params: IPostWorkflowParams) => Promise<IPostWorkflowResponseInterface>

  search: string
  handleSearch: (word: string) => void
  fetchForagePieceById: (id: number) => Promise<IOperator | undefined>
  fetchForageDataById: (id: string) => Promise<any> // TODO add type
  setFormsForageData: (id: string, data: any) => Promise<void>
  removeFormsForageDataById: (id: string) => Promise<void>
  removeFormsForageDataNotInIds: (ids: string[]) => Promise<void>
  clearForageData: () => Promise<void>
  nodeDirection: "horizontal" | "vertical"
  toggleNodeDirection: () => void
  workflowsEditorBodyFromFlowchart: () => any // TODO add type

  fetchRepoById: (params: {
    id: string
  }) => Promise<IGetRepoOperatorsResponseInterface>

  // Upstream Map
  getForageUpstreamMap: () => Promise<any> // TODO add type
  setForageUpstreamMap: (data: any) => Promise<void> // TODO add type
  clearForageUpstreamMap: () => Promise<void>
  removeForageUpstreamMapById: (id: string) => Promise<void>

  setForageCheckboxStates: (checkboxStatesMap: any) => Promise<void> // TODO add type
  getForageCheckboxStates: () => Promise<any> // TODO add type

  setNameKeyUpstreamArgsMap: (nameKeyUpstreamArgsMap: any) => Promise<void> // TODO add type
  getNameKeyUpstreamArgsMap: () => Promise<any> // TODO add type
  clearNameKeyUpstreamArgsMap: () => Promise<void>
}

export const [WorkflowsEditorContext, useWorkflowsEditor] =
  createCustomContext<IWorkflowsEditorContext>('WorkflowsEditor Context')

interface IWorkflowsEditorProviderProps {
  children?: React.ReactNode;
}
/**
 * WorkflowsEditor provider.
 * @TODO: refactor local storage implementation with Local Forage
*/
export const WorkflowsEditorProvider: FC<IWorkflowsEditorProviderProps> = ({ children }) => {
  const { workspace } = useWorkspaces()
  const [search, setSearch] = useState('')
  const [nodeDirection, setNodeDirection] = useState<'horizontal' | 'vertical'>('horizontal')
  const [repositoryOperators, setRepositoryOperatos] = useState<IRepositoryOperators>({})
  const [nodes, setNodes] = useState<IWorkflowElement[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [loadingNodes, setLoadingNodes] = useState<boolean>(true)
  const [loadingEdges, setLoadingEdges] = useState<boolean>(true)


  // Requests hooks
  const {
    data,
    error: repositoriesError,
    isValidating: repositoriesLoading
    // mutate: repositoriesRefresh
  } = useAuthenticatedGetOperatorRepositories({})

  const fetchRepoById = useFetchAuthenticatedGetRepoIdOperators()
  const postWorkflow = useAuthenticatedPostWorkflow()

  // Error handlers  
  useEffect(() => {
    if (!!repositoriesError) {
      toast.error('Error loading repositories, try again later')
    }
  }, [repositoriesError])


  // Memoized values
  const repositories: IOperatorRepository[] = useMemo(
    () => data?.data.filter((repo) => repo.name.includes(search)) ?? [],
    [data, search]
  )

  // Requests handlers
  const handleCreateWorkflow = useCallback(async (payload: IPostWorkflowParams) => {
    return postWorkflow({ ...payload, workspace_id: workspace?.id ?? '' })
  }, [postWorkflow, workspace])



  /** Operators */
  useEffect(() => {
    const updateRepositoriesOperators = async () => {
      var repositoyOperatorsAux: IRepositoryOperators = {}
      var forageOperators: IOperatorForageSchema = {}
      for (const repo of repositories) {
        fetchRepoById({ id: repo.id })
          .then((pieces: any) => {
            repositoyOperatorsAux[repo.id] = []
            for (const op of pieces) {
              repositoyOperatorsAux[repo.id].push(op)
              forageOperators[op.id] = op
            }
            setRepositoryOperatos(repositoyOperatorsAux)
            localForage.setItem("pieces", forageOperators)
          })
        // Set piece item to storage -> {piece_id: Operator}
      }
    }
    updateRepositoriesOperators()
  }, [repositories, fetchRepoById])

  // Forage handlers
  const setForageCheckboxStates = useCallback(async (checkboxStatesMap: any) => {
    await localForage.setItem('checkboxStates', checkboxStatesMap)
  }, [])

  const getForageCheckboxStates = useCallback(async () => {
    const checkboxStates = await localForage.getItem('checkboxStates')
    if (!checkboxStates) {
      return {}
    }
    return checkboxStates
  }, [])

  const clearForageCheckboxStates = useCallback(async () => {
    await localForage.setItem('checkboxStates', {})
  }, [])

  // Mapping state to map upstream dropdown names to upstream real keys
  const setNameKeyUpstreamArgsMap = useCallback(async (nameKeyUpstreamArgsMap: any) => {
    await localForage.setItem('nameKeyUpstreamArgsMap', nameKeyUpstreamArgsMap)
  }, [])

  const getNameKeyUpstreamArgsMap = useCallback(async () => {
    const nameKeyUpstreamArgsMap = await localForage.getItem<any>('nameKeyUpstreamArgsMap')
    if (!nameKeyUpstreamArgsMap) {
      return {}
    }
    return nameKeyUpstreamArgsMap
  }, [])

  const clearNameKeyUpstreamArgsMap = useCallback(async () => {
    await localForage.setItem('nameKeyUpstreamArgsMap', {})
  }, [])



  const fetchForagePieceById = useCallback(async (id: number) => {
    const pieces = await localForage.getItem<IOperatorForageSchema>("pieces")
    if (pieces !== null) {
      return pieces[id]
    }
  }, [])


  // UpstreamMap forage
  const getForageUpstreamMap = useCallback(async () => {
    const currentUpstreamMap = await localForage.getItem<any>("upstreamMap")
    if (!currentUpstreamMap) {
      return {}
    }
    return currentUpstreamMap
  }, [])

  const setForageUpstreamMap = useCallback(async (upstreamMap: any) => {
    await localForage.setItem('upstreamMap', upstreamMap)
  }, [])

  const clearForageUpstreamMap = useCallback(async () => {
    await localForage.setItem('upstreamMap', {})
  }, [])

  const removeForageUpstreamMapById = useCallback(async (id: string) => {
    const currentUpstreamMap = await localForage.getItem<any>("upstreamMap")
    if (!currentUpstreamMap) {
      return
    }
    delete currentUpstreamMap[id]
    await localForage.setItem('upstreamMap', currentUpstreamMap)
  }, [])

  // Forage forms data
  const fetchForageDataById = useCallback(async (id: string) => {
    const data = await localForage.getItem<any>('formsData')
    if (data === null) {
      return {}
    }
    return data[id]
  }, [])

  const setFormsForageData = useCallback(async (id: string, data: any) => {
    var currentData = await localForage.getItem<any>('formsData')
    if (!currentData) {
      currentData = {}
    }
    currentData[id] = data
    await localForage.setItem('formsData', currentData)
  }, [])

  const fetchFormsForageData = useCallback(async () => {
    const data = await localForage.getItem<any>('formsData')
    if (data === null) {
      return {}
    }
    return data
  }, [])

  const removeFormsForageDataById = useCallback(async (id: string) => {
    var currentData = await localForage.getItem<any>('formsData')
    if (!currentData) {
      return
    }
    delete currentData[id]
    await localForage.setItem('formsData', currentData)
  }, [])

  const removeFormsForageDataNotInIds = useCallback(async (ids: string[]) => {
    // Remove from forage "data" key the data that have keys different from the defined ids list
    var currentData = await localForage.getItem<any>('formsData')
    if (!currentData) {
      return
    }
    Object.entries(currentData).forEach(([nodeId, formData], index) => {
      if (!ids.includes(nodeId) && nodeId !== workflowFormName) {
        delete currentData[nodeId]
      }
    });
    localForage.setItem('formsData', currentData);
  }, [])

  const clearForageData = useCallback(async () => {
    await localForage.setItem('formsData', {})
    await clearForageUpstreamMap()
    await clearForageCheckboxStates()
    await clearNameKeyUpstreamArgsMap()
  }, [clearForageUpstreamMap, clearForageCheckboxStates, clearNameKeyUpstreamArgsMap])

  const setForageWorkflowNodes = useCallback(async (nodes: IWorkflowElement[]) => {
    await localForage.setItem('workflowNodes', nodes)
  }, [])

  const setForageWorkflowEdges = useCallback(async (edges: Edge[]) => {
    await localForage.setItem('workflowEdges', edges)
  }, [])

  const fetchForageWorkflowNodes = useCallback(async () => {
    var workflowNodes = await localForage.getItem<any>("workflowNodes")
    if ((!workflowNodes) || (workflowNodes.length === 0)) {
      workflowNodes = []
    }
    return workflowNodes
  }, [])

  const fetchForageWorkflowEdges = useCallback(async () => {
    var workflowEdges = await localForage.getItem<any>("workflowEdges")
    if ((!workflowEdges) || (workflowEdges.length === 0)) {
      workflowEdges = []
    }
    return workflowEdges
  }, [])

  useEffect(() => {
    (async () => {
      const forageNodes = await fetchForageWorkflowNodes()
      await setForageWorkflowNodes(forageNodes)
      setLoadingNodes(false)
    })()
  }, [])

  useEffect(() => {
    (async () => {
      const forageEdges = await fetchForageWorkflowEdges()
      await setForageWorkflowEdges(forageEdges)
      setLoadingEdges(false)
    })()
  }, [])

  // Update nodes in forage if nodes array is updated
  useEffect(() => {
    (async () => {
      if (loadingNodes) {
        return
      }
      await setForageWorkflowNodes(nodes)
    })()
  }, [nodes, setForageWorkflowNodes, loadingNodes])

  // Update edges forage on edges change
  useEffect(() => {
    (async () => {
      if (loadingEdges) {
        return
      }
      await setForageWorkflowEdges(edges)
    })()
  }, [edges, setForageWorkflowEdges, loadingEdges])

  const workflowsEditorBodyFromFlowchart = useCallback(async () => {

    const dag_dict: any = {}
    const tasks_dict: any = {}
    const nodeId2taskName: any = {}
    const taskName2nodeId: any = {}

    const ui_schema: any = {
      "nodes": {},
      "edges": []
    }

    const data = await fetchFormsForageData()
    const upstreamMap = await getForageUpstreamMap()
    const nodes = await fetchForageWorkflowNodes()
    const edges = await fetchForageWorkflowEdges()

    const workflowFormData = 'workflowForm' in data ? data['workflowForm'] : null
    dag_dict['workflow'] = workflowFormData?.config
    const storageWorkflowData = workflowFormData?.storage

    const auxTaskDict: any = {}
    for (let index = 0; index < nodes.length; index++) {
      let element = nodes[index]
      let taskIndex = 0
      let taskName = `task_${element.data.name}_${taskIndex}`
      while (taskName in auxTaskDict) {
        taskIndex += 1
        taskName = `task_${element.data.name}_${taskIndex}`
      }
      auxTaskDict[taskName] = true
      nodeId2taskName[element.id] = taskName
      taskName2nodeId[taskName] = element.id
    }

    //var task_index = 1
    for (let index = 0; index < nodes.length; index++) {
      const element = nodes[index]
      const elementData = data[element.id]

      try {
        var taskIndex = 0
        var taskName = `task_${element.data.name}_${taskIndex}`
        while (taskName in tasks_dict) {
          taskIndex += 1
          taskName = `task_${element.data.name}_${taskIndex}`
        }
        ui_schema['nodes'][taskName] = element
        const taskDict: any = {}

        const { storageSource, baseFolder, ...providerOptions } = storageWorkflowData || {}
        const storageDict: any = {
          "source": storageSource || null,
          "base_folder": baseFolder || null,
          "mode": elementData?.storage?.storageAccessMode,
          "provider_options": providerOptions || null
        }
        taskDict['workflow_shared_storage'] = storageDict

        const containerResources = {
          requests: {
            cpu: elementData?.containerResources?.cpu.min,
            memory: elementData?.containerResources?.memory.min
          },
          limits: {
            cpu: elementData?.containerResources?.cpu.max,
            memory: elementData?.containerResources?.memory.max
          },
          use_gpu: elementData?.containerResources?.useGpu
        }
        taskDict['container_resources'] = containerResources

        const nodeId = element.id
        taskDict['task_id'] = taskName
        taskDict['piece'] = {
          id: parseInt(nodeId.split('_')[0]),
          name: element.data.name
        }
        const pieceInputKwargs: any = {}
        if (nodeId in upstreamMap) {
          for (const key in upstreamMap[nodeId]) {
            const value = upstreamMap[nodeId][key]
            const fromUpstream = value['fromUpstream']
            pieceInputKwargs[key] = {
              fromUpstream: fromUpstream,
              upstreamTaskId: fromUpstream ? nodeId2taskName[value['upstreamId']] : null,
              upstreamArgument: fromUpstream ? value['upstreamArgument'] : null,
              value: value['value']
            }
          }
        }
        //console.log(pieceInputKwargs)

        taskDict['piece_input_kwargs'] = pieceInputKwargs

        tasks_dict[taskName] = taskDict
        //task_index += 1
      } catch (err) {
        console.log('Error', err)
      }

    }

    // Organize dependencies
    const dependencies_dict: any = {}
    for (let index = 0; index < edges.length; index++) {
      const edge: any = edges[index]
      const source_task_name = nodeId2taskName[edge.source]
      const target_task_name = nodeId2taskName[edge.target]
      if (target_task_name in dependencies_dict) {
        dependencies_dict[target_task_name].push(source_task_name)
      } else {
        dependencies_dict[target_task_name] = [source_task_name]
      }
    }

    // Fill in dependencies for each task
    const keys = Object.keys(tasks_dict)
    keys.forEach((key, index) => {
      tasks_dict[key]['dependencies'] = dependencies_dict[key] ? dependencies_dict[key] : []
    })
    // Finalize dag dictionary
    ui_schema['edges'] = edges
    dag_dict['tasks'] = tasks_dict
    dag_dict['ui_schema'] = ui_schema

    return dag_dict
  }, [fetchFormsForageData, getForageUpstreamMap, fetchForageWorkflowNodes, fetchForageWorkflowEdges])

  const value: IWorkflowsEditorContext = useMemo(
    () => ({
      repositories,
      repositoriesError: !!repositoriesError,
      repositoriesLoading,
      repositoryOperators,
      search,
      edges,
      setEdges,
      nodes,
      setNodes,
      handleSearch: (word: string) => setSearch(word),
      fetchRepoById,
      fetchForagePieceById,
      setFormsForageData,
      fetchForageDataById,
      removeFormsForageDataById,
      clearForageData,
      removeFormsForageDataNotInIds,
      handleCreateWorkflow,
      fetchForageWorkflowEdges: () => fetchForageWorkflowEdges(),
      fetchForageWorkflowNodes: () => fetchForageWorkflowNodes(),
      workflowsEditorBodyFromFlowchart,
      getForageUpstreamMap,
      setForageUpstreamMap,
      clearForageUpstreamMap,
      removeForageUpstreamMapById,
      nodeDirection,
      setForageCheckboxStates,
      getForageCheckboxStates,
      setNameKeyUpstreamArgsMap,
      getNameKeyUpstreamArgsMap,
      clearNameKeyUpstreamArgsMap,
      toggleNodeDirection: () =>
        setNodeDirection((current: any) =>
          current === 'vertical' ? 'horizontal' : 'vertical'
        )
    }),
    [
      fetchRepoById,
      fetchForagePieceById,
      setFormsForageData,
      fetchForageDataById,
      removeFormsForageDataById,
      clearForageData,
      removeFormsForageDataNotInIds,
      handleCreateWorkflow,
      fetchForageWorkflowEdges,
      fetchForageWorkflowNodes,
      workflowsEditorBodyFromFlowchart,
      getForageUpstreamMap,
      setForageUpstreamMap,
      clearForageUpstreamMap,
      removeForageUpstreamMapById,
      nodeDirection,
      repositories,
      repositoriesError,
      repositoriesLoading,
      repositoryOperators,
      search,
      edges,
      setEdges,
      nodes,
      setNodes,
      setForageCheckboxStates,
      getForageCheckboxStates,
      setNameKeyUpstreamArgsMap,
      getNameKeyUpstreamArgsMap,
      clearNameKeyUpstreamArgsMap
    ]
  )

  return (
    <WorkflowsEditorContext.Provider value={value}>
      {children}
    </WorkflowsEditorContext.Provider>
  )
}
