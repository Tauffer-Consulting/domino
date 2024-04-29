import { useWorkflows } from "@features/myWorkflows";
import {
  Alert,
  Grid,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { useAuthentication } from "context/authentication";
import { useWorkspaces } from "context/workspaces";
import { type FC, useCallback, useState, useMemo } from "react";

import { AddWorkspace } from "./AddWorkspace";
import { WorkspaceListItem } from "./WorkspaceListItem";
import { WorkspacePendingListItem } from "./WorkspacePendingListItem";

/**
 * Workspace list page
 * @todo handle error/loading/empty
 * @todo handle add new workspace
 */
const WorkspacesComponent: FC = () => {
  const {
    workspace,
    workspaces,
    workspacesError,
    workspacesLoading,
    handleRefreshWorkspaces,
    handleChangeWorkspace,
    handleDeleteWorkspace,
    handleRemoveUserWorkspace,
  } = useWorkspaces();

  const auth = useAuthentication();

  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<boolean>(false);
  const [deleteWorkspaceId, setDeleteWorkspaceId] = useState<string | null>(
    null,
  );

  const [isOpenLeaveDialog, setIsOpenLeaveDialog] = useState<boolean>(false);
  const [leaveWorkspaceId, setLeaveWorkspaceId] = useState<string | null>(null);

  const { data: workflowsRes } = useWorkflows({
    workspaceId: deleteWorkspaceId,
  });

  const totalWorkflows = useMemo(
    () => workflowsRes?.metadata?.total,
    [workflowsRes],
  );

  const deleteWorkspace = useCallback(() => {
    if (deleteWorkspaceId) {
      handleDeleteWorkspace(deleteWorkspaceId);
    }
    setDeleteWorkspaceId(null);
    setIsOpenDeleteDialog(false);
  }, [handleDeleteWorkspace, deleteWorkspaceId]);

  const leaveWorkspace = useCallback(() => {
    if (leaveWorkspaceId) {
      handleRemoveUserWorkspace(leaveWorkspaceId, auth.store.userId!);
    }
    setLeaveWorkspaceId(null);
    setIsOpenLeaveDialog(false);
  }, [leaveWorkspaceId, handleRemoveUserWorkspace, auth.store.userId]);

  return (
    <>
      <Dialog
        open={isOpenDeleteDialog}
        onClose={() => {
          setIsOpenDeleteDialog(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Workspace Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this workspace and all its contents?
            <br />
            {totalWorkflows ? (
              <>
                {totalWorkflows === 1
                  ? `Your workflow "${workflowsRes?.data?.[0].name}"`
                  : `All yours ${totalWorkflows}`}{" "}
                will be deleted. This action{" "}
                <span style={{ fontWeight: "bold" }}>cannot be undone</span>.
              </>
            ) : (
              <>
                This action{" "}
                <span style={{ fontWeight: "bold" }}>cannot be undone</span>.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsOpenDeleteDialog(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={deleteWorkspace} variant="outlined" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isOpenLeaveDialog}
        onClose={() => {
          setIsOpenLeaveDialog(false);
        }}
        aria-labelledby="alert-leave-dialog-title"
        aria-describedby="alert-leave-dialog-description"
      >
        <DialogTitle id="alert-leave-dialog-title">
          {"Confirm Leave Workspace"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to leave this workspace and all its contents?
            This action{" "}
            <span style={{ fontWeight: "bold" }}>
              cannot be undone and may cause workspace deletion.
            </span>
            .
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsOpenLeaveDialog(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={leaveWorkspace} variant="outlined" color="warning">
            Leave
          </Button>
        </DialogActions>
      </Dialog>
      <Typography variant="h6" component="h1">
        My workspaces
      </Typography>
      {workspacesError && (
        /* @TODO: cange alert to toast.error('Error loading workspaces') and add button ('click here to try again') */
        <Alert
          severity="warning"
          onClick={() => {
            handleRefreshWorkspaces();
          }}
        >
          Error loading workspaces, click here to try again
        </Alert>
      )}
      {workspacesLoading && (
        <Alert severity="info">Loading your workspaces...</Alert>
      )}
      <Grid container spacing={{ xs: 1, lg: 2 }} alignItems="stretch">
        <AddWorkspace />

        {workspaces.map((ws, index) =>
          ws.status === "rejected" ? null : ws.status === "pending" ? (
            <WorkspacePendingListItem
              workspace={ws}
              key={index}
              selectedWorkspaceId={workspace?.id}
            />
          ) : (
            <WorkspaceListItem
              workspace={ws}
              key={index}
              handleSelect={() => {
                handleChangeWorkspace(ws.id);
              }}
              handleDelete={() => {
                setDeleteWorkspaceId(ws.id);
                setIsOpenDeleteDialog(true);
              }}
              selectedWorkspaceId={workspace?.id}
              handleLeave={() => {
                setLeaveWorkspaceId(ws.id);
                setIsOpenLeaveDialog(true);
              }}
            />
          ),
        )}
      </Grid>
    </>
  );
};

export default WorkspacesComponent;
