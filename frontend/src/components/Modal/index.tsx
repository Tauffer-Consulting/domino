import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
  Grid,
  IconButton,
} from "@mui/material";
import React, { useCallback, useImperativeHandle, useState } from "react";

interface Props {
  title: string;
  content?: string | React.ReactNode;
  maxWidth?: DialogProps["maxWidth"];
  fullWidth?: boolean;
  confirmFn?: () => void;
  cancelFn?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export interface ModalRef {
  open: () => void;
  close: () => void;
}

export const Modal = React.forwardRef<ModalRef, Props>(
  (
    {
      cancelFn,
      confirmFn,
      title,
      content,
      maxWidth,
      fullWidth,
      confirmText,
      cancelText,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);

    const open = () => {
      setIsOpen(true);
    };

    const handleClose = useCallback(() => {
      if (cancelFn) {
        cancelFn();
      }

      setIsOpen(false);
    }, [cancelFn]);

    const handleConfirm = useCallback(() => {
      if (confirmFn) {
        confirmFn();
      }

      setIsOpen(false);
    }, [confirmFn]);

    useImperativeHandle(ref, () => ({
      open,
      close: handleClose,
    }));

    return (
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth={maxWidth}
        fullWidth={fullWidth}
      >
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{content}</DialogContent>
        <DialogActions>
          <Grid container justifyContent="center" spacing={4}>
            {cancelFn && (
              <Grid item>
                <Button onClick={handleClose} variant="contained">
                  {cancelText ?? "Cancel"}
                </Button>
              </Grid>
            )}
            {confirmFn && (
              <Grid item>
                <Button onClick={handleConfirm} variant="contained">
                  {confirmText ?? "OK"}
                </Button>
              </Grid>
            )}
          </Grid>
        </DialogActions>
      </Dialog>
    );
  },
);

Modal.displayName = "Modal";
