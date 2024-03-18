import { Box, Container } from "@mui/material";
import { type FC, type ReactNode } from "react";

import { Header } from "./header/header";

interface Props {
  children: ReactNode;
}

export const PrivateLayout: FC<Props> = ({ children }) => {
  return (
    <Box sx={{ display: "flex", width: "100%", marginTop: "64px" }}>
      <Header />

      <Container component="main" maxWidth={false} sx={{ padding: 3 }}>
        <Box sx={{ paddingLeft: 0 }}>{children}</Box>
      </Container>
    </Box>
  );
};

export default PrivateLayout;
