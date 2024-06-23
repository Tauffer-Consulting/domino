import {
  DeleteOutlined,
  PlayCircleOutlined,
  StopCircleOutlined,
} from "@mui/icons-material";
import { Button, Divider, IconButton, Tooltip, useTheme } from "@mui/material";
import { type CommonProps } from "@mui/material/OverridableComponent";
import { GridToolbarContainer } from "@mui/x-data-grid";
import { Modal, type ModalRef } from "components/Modal";
import { type IWorkflow } from "features/myWorkflows/types";
import React, { useRef, useState } from "react";

import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

interface Props extends CommonProps {
  ids: Array<IWorkflow["id"]>;
  runFn: () => void;
  deleteFn: () => void;
  disabled: boolean;
}

export const Actions: React.FC<Props> = ({ runFn, deleteFn, disabled }) => {
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
        disabled={disabled}
      >
        Stop
      </Button>
      <Divider orientation="vertical" variant="middle" flexItem />
      <Button
        color="error"
        startIcon={<DeleteOutlined />}
        onClick={deleteFn}
        disabled={disabled}
      >
        Delete
      </Button>
    </GridToolbarContainer>
  );
};
