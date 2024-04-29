export enum role {
  owner = "owner",
  admin = "admin",
  write = "write",
  read = "read",
}

export type Roles = `${role}`;
