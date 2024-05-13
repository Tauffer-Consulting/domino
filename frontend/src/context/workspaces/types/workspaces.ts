import { type Roles } from "@utils/roles";

export enum repositorySource {
  github = "github",
}

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
