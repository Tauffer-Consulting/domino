import CloseIcon from "@mui/icons-material/Close";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { Popover, IconButton, Typography } from "@mui/material";
import React from "react";
import Draggable from "react-draggable";

function renderPieceProperties(
  piece: Piece,
  key: "input_schema" | "output_schema" | "secrets_schema",
) {
  const schema = piece[key];
  const properties = schema?.properties ?? {};
  return Object.entries(properties).map(([key, value]) => {
    const argument = value;
    let typeName: string = "allOf" in argument ? "enum" : argument.type;
    let valuesOptions: string[] = [];

    if ("allOf" in argument && argument.allOf.length > 0) {
      typeName = "enum";
      const typeClass = argument.allOf[0].$ref.split("/").pop() as string;

      if (schema && "definitions" in schema) {
        // deprecated
        valuesOptions = (schema?.definitions?.[typeClass] as EnumDefinition)
          .enum;
      } else {
        valuesOptions = (schema?.$defs?.[typeClass] as EnumDefinition).enum;
      }
    }

    return (
      <Typography key={key} sx={{ padding: "0.5rem 1rem 0rem 1.5rem" }}>
        <strong>{key}</strong> [<em>{typeName}</em>] - {argument.description}
        {valuesOptions && valuesOptions.length > 0 && (
          <>
            {" Options: "}
            {valuesOptions.join(", ")}
          </>
        )}
      </Typography>
    );
  });
}

interface PieceDocsPopoverProps {
  piece: Piece;
  popoverOpen: boolean;
  handlePopoverClose: (
    event: React.MouseEvent<HTMLButtonElement>,
    reason: any,
  ) => void;
}

const PieceDocsPopover: React.FC<PieceDocsPopoverProps> = ({
  piece,
  popoverOpen,
  handlePopoverClose,
}) => (
  <Draggable handle=".popover-handle" cancel=".popover-content">
    <Popover
      disableEnforceFocus
      disableAutoFocus
      disableScrollLock
      open={popoverOpen}
      anchorPosition={{
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
      }}
      anchorReference="anchorPosition"
      onClose={handlePopoverClose}
      anchorOrigin={{
        vertical: "center",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "center",
        horizontal: "center",
      }}
      sx={{
        "& .MuiPopover-paper": {
          width: "600px",
          borderRadius: "5px",
          boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)",
          backgroundColor: "#fff",
          color: "#000",
          paddingBottom: "2rem",
          overflow: "hidden",
          "& .popover-handle": {
            backgroundColor: "#323C3D",
            padding: "0.5rem",
            "& .drag-handle": {
              cursor: "move",
              "& svg": {
                color: "#f5f5f5",
              },
            },
            "& .close-button": {
              "& svg": {
                color: "#f5f5f5",
              },
            },
          },
          "& .popover-content": {
            maxHeight: "500px",
            overflowY: "auto",
            "& .MuiTypography-root": {
              "& strong": { fontWeight: 450 },
            },
          },
        },
      }}
    >
      <div
        className="popover-handle"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="drag-handle">
          <DragHandleIcon />
        </div>
        <Typography
          sx={{
            padding: "0rem",
            fontWeight: 500,
            fontSize: "1.4rem",
            color: "#f5f5f5",
            textAlign: "center",
          }}
        >
          {piece.name}
        </Typography>
        <div className="close-button">
          <IconButton
            size="small"
            onClick={(event) => {
              handlePopoverClose(event, "closeButtonClick");
            }}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </div>
      <div className="popover-content">
        <Typography sx={{ padding: "1rem 1rem 0rem 1rem" }}>
          {piece.description}
        </Typography>
        <Typography sx={{ padding: "0rem 1rem 0rem 1rem" }}>
          {piece.source_url ? (
            <a
              href={piece.source_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              source code
            </a>
          ) : (
            <span>No source code available</span>
          )}
        </Typography>
        <Typography
          sx={{
            padding: "1rem 1rem 0rem 1rem",
            fontWeight: 500,
            fontSize: "1.3rem",
          }}
        >
          Input
        </Typography>
        {renderPieceProperties(piece, "input_schema")}
        <Typography
          sx={{
            padding: "1rem 1rem 0rem 1rem",
            fontWeight: 500,
            fontSize: "1.3rem",
          }}
        >
          Output
        </Typography>
        {renderPieceProperties(piece, "output_schema")}
        {piece.secrets_schema && (
          <Typography
            sx={{
              padding: "1rem 1rem 0rem 1rem",
              fontWeight: 500,
              fontSize: "1.3rem",
            }}
          >
            Secrets
          </Typography>
        )}
        {piece.secrets_schema && renderPieceProperties(piece, "secrets_schema")}
      </div>
    </Popover>
  </Draggable>
);

export default PieceDocsPopover;
