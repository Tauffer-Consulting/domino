import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { IconButton } from "@mui/material";
import { type CommonProps } from "@mui/material/OverridableComponent";
import { Modal, type ModalRef } from "components/Modal";
import { type IWorkflow } from "features/workflows/types";
import theme from "providers/theme.config";
import React, { useRef, useState } from "react";

import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

interface Props extends CommonProps {
  id: IWorkflow["id"];
  deleteFn: () => void;
  runFn: () => void;
  pauseFn: () => void;
}

export const Actions: React.FC<Props> = ({ runFn, deleteFn, className }) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const newFeatureModal = useRef<ModalRef>(null);

  return (
    <>
      <IconButton className={className} onClick={runFn}>
        <PlayCircleOutlineIcon
          style={{ pointerEvents: "none", color: theme.palette.success.main }}
        />
      </IconButton>
      <IconButton
        className={className}
        onClick={() => {
          newFeatureModal.current?.open();
        }}
      >
        <PauseCircleOutlineIcon
          style={{ pointerEvents: "none", color: theme.palette.info.main }}
        />
      </IconButton>
      <IconButton
        className={className}
        onClick={() => {
          setDeleteModalOpen(true);
        }}
      >
        <DeleteOutlineIcon
          style={{ pointerEvents: "none", color: theme.palette.error.main }}
        />
      </IconButton>
      <Modal
        title="New Feature"
        content="This feature is not ready yet! We launch new versions every time,
          check out our changelog for more information !"
        ref={newFeatureModal}
      />
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title="Confirm Workflow Deletion"
        content={
          <span>
            Are you sure you want to delete this workflow? This action{" "}
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
    </>
  );
};
