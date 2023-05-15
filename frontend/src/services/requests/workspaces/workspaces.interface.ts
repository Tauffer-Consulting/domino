import { ERepositorySource } from "common/interfaces/repository-source.enum"

// Workspace status enum with values (pending, accepted and rejected)
export enum EWorkspaceStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export interface IWorkspaceSummary {
  id: string
  workspace_name: string
  user_permission: string
  status: EWorkspaceStatus
  github_access_token_filled: boolean
}

export interface IWorkspaceDetails {
  id: string
  workspace_name: string
  github_access_token_filled: string
  // users: { user_id: string, permission: string }[]
  // operators_repositories: {
  //   repository_id: string
  //   repository_name: string
  //   repository_source: ERepositorySource | string
  // }[]
}

export type IGetWorkspacesResponseInterface = IWorkspaceSummary[]
export type IGetWorkspaceIdResponseInterface = IWorkspaceSummary

/**
 * @todo type properly
 */
export type IPostWorkspaceRepositoryResponseInterface = Record<string, unknown>

export interface IPostWorkspaceRepositoryPayload {
  workspace_id: string
  source: ERepositorySource | string
  path: string
  version: string
}
export interface IPostWorkspaceRepositoryParams {
  id: string
  data: IPostWorkspaceRepositoryPayload
}
