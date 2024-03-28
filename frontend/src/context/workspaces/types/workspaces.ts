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

export interface WorkspaceSummary {
  id: string;
  workspace_name: string;
  user_permission: Roles;
  status: workspaceStatus;
  github_access_token_filled: boolean;
}

export interface WorkspaceDetails {
  id: string;
  workspace_name: string;
  github_access_token_filled: string;
}

export interface IGetWorkspaceUsersResponse {
  data: [
    {
      user_id: number;
      user_email: string;
      user_permission: string;
      status: workspaceStatus;
    },
  ];
  metadata: PaginationMetadata;
}

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
