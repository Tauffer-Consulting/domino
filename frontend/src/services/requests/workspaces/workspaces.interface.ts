import { ERepositorySource } from "common/interfaces/repository-source.enum"

// Workspace status enum with values (pending, accepted and rejected)
export enum EWorkspaceStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

interface IPaginationMetadata {
  page: number
  records: number
  total: number
  last_page: number
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
export type IGetWorkspaceUsersResponse = {
  data: [{
    user_id: number
    user_email: string
    user_permission: string,
    status: EWorkspaceStatus
  }],
  metadata: IPaginationMetadata
}

/**
 * @todo type properly
 */
export type IPostWorkspaceRepositoryResponseInterface = Record<string, unknown>

export interface IPostWorkspaceRepositoryPayload {
  workspace_id: string
  source: ERepositorySource | string
  path: string
  version: string,
  url: string
}
export interface IPostWorkspaceRepositoryParams {
  id: string
  data: IPostWorkspaceRepositoryPayload
}
