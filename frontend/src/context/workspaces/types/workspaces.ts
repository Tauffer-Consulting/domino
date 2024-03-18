import { type Roles } from "@utils/roles";

export enum repositorySource {
  github = "github",
}

// Workspace status enum with values (pending, accepted and rejected)
export enum workspaceStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

interface IPaginationMetadata {
  page: number;
  records: number;
  total: number;
  last_page: number;
}

export interface IWorkspaceSummary {
  id: string;
  workspace_name: string;
  user_permission: Roles;
  status: workspaceStatus;
  github_access_token_filled: boolean;
}

export interface IWorkspaceDetails {
  id: string;
  workspace_name: string;
  github_access_token_filled: string;
  // users: { user_id: string, permission: string }[]
  // Pieces_repositories: {
  //   repository_id: string
  //   repository_name: string
  //   repository_source: ERepositorySource | string
  // }[]
}

export type IGetWorkspacesResponseInterface = IWorkspaceSummary[];
export type IGetWorkspaceIdResponseInterface = IWorkspaceSummary;
export interface IGetWorkspaceUsersResponse {
  data: [
    {
      user_id: number;
      user_email: string;
      user_permission: string;
      status: workspaceStatus;
    },
  ];
  metadata: IPaginationMetadata;
}

/**
 * @todo type properly
 */
export type IPostWorkspaceRepositoryResponseInterface = Record<string, unknown>;

export interface IPostWorkspaceRepositoryPayload {
  workspace_id: string;
  source: repositorySource | string;
  path: string;
  version: string;
  url: string;
}
export interface IPostWorkspaceRepositoryParams {
  id: string;
  data: IPostWorkspaceRepositoryPayload;
}
