import { Container, Paper } from "@mui/material";
import React from "react";

const _A4_ASPECT_RATIO = 1.414;

export const PaperA4: React.FC<{ children?: React.ReactNode; id: string }> = ({
  children,
  id,
}) => {
  return (
    <Container
      style={{
        width: `76vw`,
        padding: 0,
        height: `calc(82vh - 14px)`,
        maxHeight: "calc(82vh - 14px)",
        display: "flex",
        flexDirection: "column",
        marginLeft: 0,
        marginRight: 0,
        maxWidth: "none",
      }}
    >
      <Paper
        id={id}
        className="paper-a4-container"
        sx={{
          width: "100%",
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        {children}
      </Paper>
    </Container>
  );
};
