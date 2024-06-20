import {
  DeleteOutlined,
  PlayCircleOutlined,
  StopCircleOutlined,
} from "@mui/icons-material";
import { Button, Divider } from "@mui/material";
import { type CommonProps } from "@mui/material/OverridableComponent";
import { GridToolbarContainer } from "@mui/x-data-grid";
import { type IWorkflow } from "features/myWorkflows/types";
import React, { useState } from "react";

import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

interface Props extends CommonProps {
  ids: Array<IWorkflow["id"]>;
  runFn: () => void;
  stopFn: () => void;
  deleteFn: () => void;
  disabled: boolean;
}

export const Actions: React.FC<Props> = ({
  ids,
  runFn,
  stopFn,
  deleteFn,
  disabled,
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  return (
    <GridToolbarContainer sx={{ borderBottom: 1 }}>
      <Button
        color="primary"
        startIcon={<PlayCircleOutlined />}
        onClick={runFn}
        disabled={disabled}
      >
        Start
      </Button>
      <Divider orientation="vertical" variant="middle" flexItem />
      <Button
        color="primary"
        startIcon={<StopCircleOutlined />}
        onClick={stopFn}
        disabled={disabled}
      >
        Stop
      </Button>
      <Divider orientation="vertical" variant="middle" flexItem />
      <Button
        color="error"
        startIcon={<DeleteOutlined />}
        onClick={() => {
          setDeleteModalOpen(true);
        }}
        disabled={disabled}
      >
        Delete
      </Button>
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title="Confirm Workflow Deletion"
        content={
          <span>
            Are you sure you want to delete selected {ids.length} workflows?
            This action{" "}
            <span style={{ fontWeight: "bold" }}>cannot be undone</span>.
          </span>
        }
        confirmCb={() => {
          deleteFn();
          setDeleteModalOpen(false);
        }}
        cancelCb={() => {
          setDeleteModalOpen(false);
        }}
        confirmText="Delete"
      />
    </GridToolbarContainer>
  );
};
