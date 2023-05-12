import { FC, useCallback, useMemo, useState } from 'react'
import { toast } from 'react-toastify'

import {
  IWorkspaceSummary,
  useAuthenticatedGetWorkspaces,
  useAuthenticatedPostWorkspaces,
  useAuthenticatedDeleteWorkspaces
} from 'services/requests/workspaces'

import { createCustomContext } from 'utils'

interface IWorkspacesContext {
  workspaces: IWorkspaceSummary[]
  workspacesError: boolean
  workspacesLoading: boolean
  handleRefreshWorkspaces: () => void

  workspace: IWorkspaceSummary | null
  handleChangeWorkspace: (id: string) => void
  handleCreateWorkspace: (name: string) => Promise<unknown>
  handleDeleteWorkspace: (id: string) => void
  handleUpdateWorkspace: (workspace: IWorkspaceSummary) => void
}

export const [WorkspacesContext, useWorkspaces] =
  createCustomContext<IWorkspacesContext>('Workspaces Context')

interface IWorkspacesProviderProps {
  children: React.ReactNode
}

export const WorkspacesProvider: FC<IWorkspacesProviderProps> = ({ children }) => {
  const [workspace, setWorkspace] = useState<IWorkspaceSummary | null>(
    !!localStorage.getItem('workspace')
      ? (JSON.parse(localStorage.getItem('workspace')!) as IWorkspaceSummary)
      : null
  )

  // Requests hooks
  const {
    data,
    error: workspacesError,
    isValidating: workspacesLoading,
    mutate: workspacesRefresh
  } = useAuthenticatedGetWorkspaces()

  const postWorkspace = useAuthenticatedPostWorkspaces()
  const deleteWorkspace = useAuthenticatedDeleteWorkspaces()

  // Memoized data
  const workspaces: IWorkspaceSummary[] = useMemo(() => data ?? [], [data])

  // Handlers
  const handleCreateWorkspace = useCallback(
    (name: string) =>
      postWorkspace({ name })
        .then((data) => {
          toast.success(`Workflow ${name} created successfully`)
          workspacesRefresh()
          return data
        })
        .catch(() => {
          toast.error('Error creating workspace, try again later')
        }),
    [postWorkspace, workspacesRefresh]
  )
  const handleUpdateWorkspace = useCallback((workspace: IWorkspaceSummary) => {
    setWorkspace(workspace)
    localStorage.setItem('workspace', JSON.stringify(workspace))
  }, [])

  const handleChangeWorkspace = useCallback(
    (id: string) => {
      const next =
        workspaces.filter((workspace) => workspace.id === id)?.[0] ?? null
      //setWorkspace(next)
      //localStorage.setItem('workspace', JSON.stringify(next))
      handleUpdateWorkspace(next)
    },
    [workspaces, handleUpdateWorkspace]
  )

  const handleDeleteWorkspace = useCallback((id: string)=>{
    deleteWorkspace({id}).then(() => {
      const storageWorkspace = JSON.parse(localStorage.getItem('workspace')!)
        if (storageWorkspace && storageWorkspace.id === id) {
          localStorage.removeItem('workspace')
          setWorkspace(null)
        }
        workspacesRefresh()
      }
    ).catch((error) => {
      console.log('Deleting workspace error:', error)
    })
  }, [deleteWorkspace, workspacesRefresh])

  return (
    <WorkspacesContext.Provider
      value={{
        workspaces,
        workspacesError: !!workspacesError,
        workspacesLoading,
        handleRefreshWorkspaces: () => workspacesRefresh(),
        workspace,
        handleChangeWorkspace,
        handleCreateWorkspace,
        handleDeleteWorkspace,
        handleUpdateWorkspace
      }}
    >
      {children}
    </WorkspacesContext.Provider>
  )
}
