import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import {
  IWorkflow,
  IGetWorkflowResponseInterface,
  useAuthenticatedDeleteWorkflowId,
  useAuthenticatedGetWorkflows,
  useAuthenticatedPostWorkflowRunId,
  useAuthenticatedGetWorkflowId
} from 'services/requests/workflow'


import {
  useAuthenticatedGetWorkflowRuns,
  IGetWorkflowRunsResponseInterface,
  useAuthenticatedGetWorkflowRunTasks,
  useAuthenticatedGetWorkflowRunTaskLogs,
  IGetWorkflowRunTasksResponseInterface,
} from 'services/requests/runs'

import { createCustomContext } from 'utils'

interface IWorkflowsContext {
  workflows: IGetWorkflowResponseInterface
  workflowsError: boolean
  workflowsLoading: boolean

  handleDeleteWorkflow: (id: string) => Promise<any>
  handleRefreshWorkflows: () => void
  handleFetchWorkflow: (id: string) => Promise<IWorkflow>
  handleRunWorkflow: (id: string) => Promise<any>
  tablePage: number
  setTablePage: (page: number) => void
  tablePageSize: number
  setTablePageSize: (pageSize: number) => void
  runsTablePage: number
  setRunsTablePage: (page: number) => void
  runsTablePageSize: number
  setRunsTablePageSize: (pageSize: number) => void
  selectedWorkflow: IWorkflow | null
  setSelectedWorkflow: (workflow: IWorkflow | null) => void

  workflowRuns: IGetWorkflowRunsResponseInterface
  selectedWorkflowRunId: string | null
  setSelectedWorkflowRunId: (workflowRunId: string | null) => void

  handleFetchWorkflowRunTasks: (page: number, pageSize: number) => Promise<IGetWorkflowRunTasksResponseInterface>
  handleRefreshWorkflowRuns: () => void
  handleFetchWorkflowRunTaskLogs: (taskId: string, taskTryNumber: string) => Promise<any>

}

export const [WorkflowsContext, useWorkflows] =
  createCustomContext<IWorkflowsContext>('Workflows Context')

interface IWorkflowsProviderProps {
  children?: React.ReactNode
}
/**
 * Workflows provider.
 */
export const WorkflowsProvider: FC<IWorkflowsProviderProps> = ({ children }) => {
  // Workflows table settings
  const [tablePage, setTablePage] = useState(0);
  const [tablePageSize, setTablePageSize] = useState(10);
  
  // Workflow runs table settings
  const [runsTablePage, setRunsTablePage] = useState(0)
  const [runsTablePageSize, setRunsTablePageSize] = useState(10)

  // Store data of user interaction with table rows
  const [selectedWorkflow, setSelectedWorkflow] = useState<IWorkflow | null>(null);
  const [selectedWorkflowRunId, setSelectedWorkflowRunId] = useState<string | null>(null);

  // Requests Hooks
  const {
    data,
    error: workflowsError,
    isValidating: workflowsLoading,
    mutate: workflowsRefresh
  } = useAuthenticatedGetWorkflows(tablePage, tablePageSize)


  const {
    data: workflowRunsData,
    error: workflowRunError,
    mutate: workflowRunsRefresh
  } = useAuthenticatedGetWorkflowRuns({ workflowId: selectedWorkflow?.id.toString() || '', page: runsTablePage, pageSize: runsTablePageSize })

  const deleteWorkflow = useAuthenticatedDeleteWorkflowId()
  const fetchWorkflowById = useAuthenticatedGetWorkflowId()
  const runWorkflowById = useAuthenticatedPostWorkflowRunId()
  const fetchWorkflowRunTasks = useAuthenticatedGetWorkflowRunTasks()
  const fetchWorkflowRunTaskLogs = useAuthenticatedGetWorkflowRunTaskLogs()

  useEffect(() => {
    if (!!workflowsError) {
      toast.error('Error loading workflows, try again later')
    }
  }, [workflowsError])

  useEffect(() => {
    if (!!workflowRunError) {
      toast.error('Error loading workflow runs, try again later')
    }
  }, [workflowRunError])


  /**
   * Workflows data
   */
  const workflows: IGetWorkflowResponseInterface = useMemo(() => {
    return data ?? {
      data: [],
      metadata: {
        page: 0,
        last_page: 0,
        records: 0,
        total: 0
      }
    }
  }, [data])

  const workflowRuns: IGetWorkflowRunsResponseInterface = useMemo(() => {
    return workflowRunsData ?? {
      data: [],
      metadata: {
        page: 0,
        last_page: 0,
        records: 0,
        total: 0
      }
    }
  }, [workflowRunsData])

  // Requests handlers
  const handleFetchWorkflowRunTasks = useCallback(async (page: number = 0, pageSize: number = 100) => {
    const workflowId = selectedWorkflow?.id.toString() || ''
    const runId = selectedWorkflowRunId || ''
    return fetchWorkflowRunTasks({ workflowId, runId, page, pageSize })
  }, [fetchWorkflowRunTasks, selectedWorkflow, selectedWorkflowRunId])

  const handleFetchWorkflowRunTaskLogs = useCallback(async (taskId: string, taskTryNumber: string) => {
    const workflowId = selectedWorkflow?.id.toString() || ''
    const runId = selectedWorkflowRunId || ''
    return fetchWorkflowRunTaskLogs({ workflowId, runId, taskId, taskTryNumber })
  }, [fetchWorkflowRunTaskLogs, selectedWorkflow, selectedWorkflowRunId])


  const value: IWorkflowsContext = useMemo(
    () => ({
      workflows,
      workflowsError: !!workflowsError,
      workflowsLoading,
      handleDeleteWorkflow: (id: string) => deleteWorkflow({ id }),
      handleRefreshWorkflows: () => workflowsRefresh(),
      handleFetchWorkflow: (id: string) => fetchWorkflowById({ id }),
      handleRunWorkflow: (id: string) => runWorkflowById({ id }),
      handleFetchWorkflowRunTaskLogs: (taskId: string, taskTryNumber: string) => handleFetchWorkflowRunTaskLogs(taskId, taskTryNumber),
      tablePage,
      setTablePage,
      tablePageSize,
      setTablePageSize,
      runsTablePage,
      setRunsTablePage,
      runsTablePageSize,
      setRunsTablePageSize,
      selectedWorkflow,
      setSelectedWorkflow,
      workflowRuns,
      selectedWorkflowRunId,
      setSelectedWorkflowRunId,
      handleRefreshWorkflowRuns: () => workflowRunsRefresh(),
      handleFetchWorkflowRunTasks: handleFetchWorkflowRunTasks
    }),
    [
      workflows,
      workflowsError,
      workflowsLoading,
      deleteWorkflow,
      workflowsRefresh,
      fetchWorkflowById,
      runWorkflowById,
      tablePage,
      setTablePage,
      tablePageSize,
      setTablePageSize,
      runsTablePage,
      setRunsTablePage,
      runsTablePageSize,
      setRunsTablePageSize,
      selectedWorkflow,
      setSelectedWorkflow,
      workflowRuns,
      selectedWorkflowRunId,
      setSelectedWorkflowRunId,
      workflowRunsRefresh,
      handleFetchWorkflowRunTasks,
      handleFetchWorkflowRunTaskLogs
    ]
  )

  return (
    <WorkflowsContext.Provider value={value}>
      {children}
    </WorkflowsContext.Provider>
  )
}
