import {
  useGetWorkspaces,
  useCreateWorkspace,
  useDeleteWorkspace,
  useAcceptWorkspaceInvite,
  useRejectWorkspaceInvite,
  useInviteWorkspace,
  useRemoveUserFomWorkspace,
  useWorkspaceUsers,
} from "@features/workspaces";
import { type FC, useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { createCustomContext } from "utils";

import { type WorkspaceSummary } from "./types/workspaces";

interface IWorkspacesContext {
  workspaces: WorkspaceSummary[];
  workspacesError: boolean;
  workspacesLoading: boolean;
  handleRefreshWorkspaces: () => void;

  workspace: WorkspaceSummary | null;
  handleChangeWorkspace: (id: string) => void;
  handleCreateWorkspace: (name: string) => Promise<unknown>;
  handleDeleteWorkspace: (id: string) => void;
  handleUpdateWorkspace: (workspace: WorkspaceSummary) => void;
  handleAcceptWorkspaceInvite: (id: string) => void;
  handleRejectWorkspaceInvite: (id: string) => void;
  handleInviteUserWorkspace: (
    id: string,
    userEmail: string,
    permission: string,
  ) => void;
  handleRemoveUserWorkspace: (workspaceId: string, userId: string) => void;
  workspaceUsers: any;
  workspaceUsersTablePageSize: number;
  workspaceUsersTablePage: number;
  setWorkspaceUsersTablePageSize: (pageSize: number) => void;
  setWorkspaceUsersTablePage: (page: number) => void;
}

export const [WorkspacesContext, useWorkspaces] =
  createCustomContext<IWorkspacesContext>("Workspaces Context");

interface IWorkspacesProviderProps {
  children: React.ReactNode;
}

export const WorkspacesProvider: FC<IWorkspacesProviderProps> = ({
  children,
}) => {
  const [workspace, setWorkspace] = useState<WorkspaceSummary | null>(
    localStorage.getItem("workspace")
      ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (JSON.parse(localStorage.getItem("workspace")!) as WorkspaceSummary)
      : null,
  );

  const [workspaceUsersTablePageSize, setWorkspaceUsersTablePageSize] =
    useState<number>(5);
  const [workspaceUsersTablePage, setWorkspaceUsersTablePage] =
    useState<number>(0);

  // Requests hooks
  const {
    data,
    error: workspacesError,
    isLoading: workspacesLoading,
    refetch: workspacesRefresh,
  } = useGetWorkspaces();

  const { data: workspaceUsers } = useWorkspaceUsers({
    workspaceId: workspace?.id,
    page: workspaceUsersTablePage,
    pageSize: workspaceUsersTablePageSize,
  });

  const { mutateAsync: postWorkspace } = useCreateWorkspace();
  const { mutateAsync: deleteWorkspace } = useDeleteWorkspace();

  const { mutateAsync: acceptWorkspaceInvite } = useAcceptWorkspaceInvite();
  const { mutateAsync: rejectWorkspaceInvite } = useRejectWorkspaceInvite();
  const { mutateAsync: inviteWorkspace } = useInviteWorkspace({
    workspaceId: workspace?.id,
  });
  const { mutateAsync: removeUserWorkspace } = useRemoveUserFomWorkspace({
    workspaceId: workspace?.id,
  });

  // Memoized data
  const workspaces: WorkspaceSummary[] = useMemo(() => data ?? [], [data]);

  // Handlers
  const handleRemoveUserWorkspace = useCallback(
    (workspaceId: string, userId: string) => {
      if (!workspaceId || !userId) {
        toast.error(
          "Workspace and user must be defined to remove user from workspace.",
        );
      }
      removeUserWorkspace({ userId })
        .then(() => {
          toast.success(`User removed successfully from workspace.`);
          const storageWorkspace = JSON.parse(
            localStorage.getItem("workspace") ?? "{}",
          );
          if (storageWorkspace && storageWorkspace.id === workspaceId) {
            localStorage.removeItem("workspace");
            setWorkspace(null);
          }
          void workspacesRefresh();
        })
        .catch((error) => {
          console.log("Removing user error:", error.response.data.detail);
        });
    },
    [removeUserWorkspace, workspacesRefresh],
  );

  const handleInviteUserWorkspace = useCallback(
    (id: string, userEmail: string, permission: string) => {
      if (!id) {
        return false;
      }
      inviteWorkspace({
        userEmail,
        permission,
      })
        .then(() => {
          toast.success(`User invited successfully`);
        })
        .catch((error) => {
          console.log("Inviting user error:", error.response.data.detail);
        });
    },
    [inviteWorkspace],
  );

  const handleAcceptWorkspaceInvite = useCallback(
    async (id: string) => {
      acceptWorkspaceInvite({ workspaceId: id })
        .then(() => {
          // toast.success(`Workspace invitation accepted successfully`)
          void workspacesRefresh();
        })
        .catch((error) => {
          // todo custom msg
          console.log("Accepting workspace invitation error:", error);
          toast.error("Error accepting workspace invitation, try again later");
        });
    },
    [acceptWorkspaceInvite, workspacesRefresh],
  );

  const handleRejectWorkspaceInvite = useCallback(
    async (id: string) => {
      rejectWorkspaceInvite({ workspaceId: id })
        .then(() => {
          toast.error(`You have rejected the workspace invitation.`);
          void workspacesRefresh();
        })
        .catch((error) => {
          // todo custom msg
          console.log("Rejecting workspace invitation error:", error);
          toast.error("Error rejecting workspace invitation, try again later");
        });
    },
    [rejectWorkspaceInvite, workspacesRefresh],
  );

  const handleCreateWorkspace = useCallback(
    async (name: string) =>
      await postWorkspace({ name })
        .then((data) => {
          toast.success(`Workspace ${name} created successfully`);
          void workspacesRefresh();
          return data;
        })
        .catch(() => {
          toast.error("Error creating workspace, try again later");
        }),
    [postWorkspace, workspacesRefresh],
  );
  const handleUpdateWorkspace = useCallback((workspace: WorkspaceSummary) => {
    setWorkspace(workspace);
    localStorage.setItem("workspace", JSON.stringify(workspace));
  }, []);

  const handleChangeWorkspace = useCallback(
    (id: string) => {
      const next =
        workspaces.filter((workspace) => workspace.id === id)?.[0] ?? null;
      // setWorkspace(next)
      // localStorage.setItem('workspace', JSON.stringify(next))
      handleUpdateWorkspace(next);
    },
    [workspaces, handleUpdateWorkspace],
  );

  const handleDeleteWorkspace = useCallback(
    (id: string) => {
      deleteWorkspace({ workspaceId: id })
        .then(() => {
          const storageWorkspace = JSON.parse(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            localStorage.getItem("workspace")!,
          );
          if (storageWorkspace && storageWorkspace.id === id) {
            localStorage.removeItem("workspace");
            setWorkspace(null);
          }
          void workspacesRefresh();
        })
        .catch((error) => {
          console.log("Deleting workspace error:", error);
          if (error.response.status === 403) {
            toast.error("You don't have permission to delete this workspace.");
            return;
          }
          toast.error("Error deleting workspace, try again later");
        });
    },
    [deleteWorkspace, workspacesRefresh],
  );

  return (
    <WorkspacesContext.Provider
      value={{
        workspaces,
        workspacesError: !!workspacesError,
        workspacesLoading,
        handleRefreshWorkspaces: async () => await workspacesRefresh(),
        workspace,
        handleChangeWorkspace,
        handleCreateWorkspace,
        handleDeleteWorkspace,
        handleUpdateWorkspace,
        handleAcceptWorkspaceInvite,
        handleRejectWorkspaceInvite,
        handleInviteUserWorkspace,
        handleRemoveUserWorkspace,
        workspaceUsers,
        workspaceUsersTablePageSize,
        workspaceUsersTablePage,
        setWorkspaceUsersTablePageSize,
        setWorkspaceUsersTablePage,
      }}
    >
      {children}
    </WorkspacesContext.Provider>
  );
};
