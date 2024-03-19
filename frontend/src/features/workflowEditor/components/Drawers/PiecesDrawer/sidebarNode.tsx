import HelpIcon from "@mui/icons-material/Help";
import { Box, Typography, IconButton } from "@mui/material";
import theme from "providers/theme.config";
import React, { type FC, useState } from "react";

import PieceDocsPopover from "./pieceDocsPopover";

const PiecesSidebarNode: FC<{
  piece: Piece;
  orientation: "horizontal" | "vertical";
}> = ({ piece, orientation }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Drag and drop from sidebar to Workflow area
  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeData: any,
  ) => {
    const data = JSON.stringify({ ...nodeData.nodeData, orientation });
    event.dataTransfer.setData("application/reactflow", data);
    event.dataTransfer.effectAllowed = "move";
  };

  // Help popover
  const handlePopoverOpen = () => {
    setPopoverOpen(true);
  };

  const handlePopoverClose = (
    event: React.MouseEvent<HTMLButtonElement>,
    reason: any,
  ) => {
    if (reason && reason === "backdropClick") return;
    setPopoverOpen(false);
  };

  return (
    <Box
      sx={{
        margin: "5px",
        border: "1px solid #ccc",
        padding: "0.5rem",
        borderRadius: "5px",
      }}
      onDragStart={(event) => {
        onDragStart(event, { nodeData: piece });
      }}
      draggable
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography
          variant="body1"
          sx={{
            width: "100%",
            textOverflow: "ellipsis",
            overflow: "hidden",
            maxWidth: "180px",
          }}
        >
          {piece?.style?.label ?? "-"}
        </Typography>

        <IconButton sx={{ padding: 0 }} onClick={handlePopoverOpen}>
          <HelpIcon
            sx={{ height: "20px", color: theme.palette.primary.main }}
          />
        </IconButton>
      </div>

      <PieceDocsPopover
        piece={piece}
        popoverOpen={popoverOpen}
        handlePopoverClose={handlePopoverClose}
      />
    </Box>
  );
};

export default PiecesSidebarNode;
