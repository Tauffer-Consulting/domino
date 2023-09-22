import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from "@mui/material";
import React, { useCallback } from "react";

interface Props {
  isOpen: boolean;
  title: string;
  content: React.ReactElement;
  confirmCb: () => void;
  cancelCb: () => void;

  confirmText?: string;
  cancelText?: string;
}

export const ConfirmDeleteModal: React.FC<Props> = ({
  isOpen,
  title,
  content,
  confirmCb,
  cancelCb,
  confirmText,
  cancelText,
}) => {
  const cancel = useCallback(() => {
    cancelCb();
  }, [cancelCb]);

  const confirm = useCallback(() => {
    confirmCb();
  }, [confirmCb]);

  return (
    <Dialog
      open={isOpen}
      onClose={cancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Grid container justifyContent="center" spacing={4}>
          <Grid item>
            <Button onClick={cancel} autoFocus variant="contained">
              {cancelText ?? "Cancel"}
            </Button>
          </Grid>
          <Grid item>
            <Button onClick={confirm} variant="outlined" color="error">
              {confirmText ?? "Confirm"}
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};
