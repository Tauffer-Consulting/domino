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
        width: `calc(60vw)`,
        padding: 0,
        height: `calc(60vw*1.414)`,
        maxHeight: "88vh",
        display: "flex",
        flexDirection: "column",
        marginTop: "36px",
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
