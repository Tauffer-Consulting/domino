import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from "@mui/material";
import React from "react";

interface Props {
  isOpen: boolean;
  confirmFn: () => void;
}

export const NewFeatureDialog: React.FC<Props> = ({ isOpen, confirmFn }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={confirmFn}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">New feature</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          This feature is not ready yet! We launch new versions every time,
          check out our changelog for more information !
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Grid container justifyContent="center" spacing={4}>
          <Grid item>
            <Button onClick={confirmFn} variant="contained">
              OK
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};
