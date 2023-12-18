import { Container, Paper } from "@mui/material";
import React from "react";

const A4_ASPECT_RATIO = 1.414;

export const PaperA42: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Container
      style={{
        width: "100vw",
        padding: 0,
        display: "flex",
      }}
    >
      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
        }}
      >
        {children}
      </Paper>
    </Container>
  );
};
