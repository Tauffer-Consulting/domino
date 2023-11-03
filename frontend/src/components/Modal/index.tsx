import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
  Grid,
} from "@mui/material";
import React, { useCallback, useImperativeHandle, useState } from "react";

interface Props {
  title: string;
  content?: string | React.ReactNode;
  maxWidth?: DialogProps["maxWidth"];
  fullWidth?: boolean;
  confirmFn?: () => void;
  cancelFn?: () => void;
}

export interface ModalRef {
  open: () => void;
  close: () => void;
}

export const Modal = React.forwardRef<ModalRef, Props>(
  ({ cancelFn, confirmFn, title, content, maxWidth, fullWidth }, ref) => {
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
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{content}</DialogContent>
        <DialogActions>
          <Grid container justifyContent="center" spacing={4}>
            {cancelFn && (
              <Grid item>
                <Button onClick={handleClose} variant="contained">
                  Cancel
                </Button>
              </Grid>
            )}
            <Grid item>
              <Button onClick={handleConfirm} variant="contained">
                OK
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>
    );
  },
);

Modal.displayName = "Modal";
