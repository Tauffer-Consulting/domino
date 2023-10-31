import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from "@mui/material";
import React, { useCallback, useImperativeHandle, useState } from "react";

interface Props {
  title: string;
  content?: string | React.ReactNode;

  confirmFn?: () => void;
  cancelFn?: () => void;
}

export interface ModalRef {
  open: () => void;
  close: () => void;
}

export const Modal = React.forwardRef<ModalRef, Props>(
  ({ cancelFn, confirmFn, title, content }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const open = () => {
      setIsOpen(true);
    };

    const handleClose = useCallback(() => {
      if (cancelFn) {
        cancelFn();
      }

      setIsOpen(false);
    }, []);

    const handleConfirm = useCallback(() => {
      if (confirmFn) {
        confirmFn();
      }

      setIsOpen(false);
    }, []);

    useImperativeHandle(ref, () => ({
      open,
      close: handleClose,
    }));

    return (
      <Dialog open={isOpen} onClose={handleClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{content}</DialogContentText>
        </DialogContent>
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
