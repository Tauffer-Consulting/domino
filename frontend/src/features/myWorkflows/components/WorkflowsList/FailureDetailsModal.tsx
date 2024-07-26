import { type IBatchWorkflowActionDetail } from "@features/myWorkflows/types";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useCallback } from "react";

interface Props {
  isOpen: boolean;
  title: string;
  data: IBatchWorkflowActionDetail[];
  cancelCb: () => void;
}

const columns: Array<GridColDef<IBatchWorkflowActionDetail>> = [
  { field: "id", headerName: "ID", width: 90 },
  {
    field: "message",
    headerName: "Message",
    width: 400,
  },
];

export const FailureDetailsModal: React.FC<Props> = ({
  isOpen,
  title,
  data,
  cancelCb,
}) => {
  const cancel = useCallback(() => {
    cancelCb();
  }, [cancelCb]);
  return (
    <Dialog
      open={isOpen}
      onClose={cancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DataGrid
          density="compact"
          columns={columns}
          rows={data}
          disableDensitySelector
          disableRowSelectionOnClick
          hideFooterSelectedRowCount
          disableColumnMenu
          disableColumnSelector
        />
      </DialogContent>
    </Dialog>
  );
};
