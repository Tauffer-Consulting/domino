import { Container, Paper } from "@mui/material";
import React from "react";

const A4_ASPECT_RATIO = 1.414;

export const PaperA4: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Container
      style={{
        width: "100vw",
        height: `${100 / A4_ASPECT_RATIO}vw`,
        padding: 0,
        display: "flex",
      }}
    >
      <Paper sx={{ width: "100%", height: `100%` }}>{children}</Paper>
    </Container>
  );
};
