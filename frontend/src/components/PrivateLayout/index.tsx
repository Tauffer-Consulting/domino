import { Box, Container } from "@mui/material";
import { type FC, type ReactNode } from "react";

import { DrawerHeader } from "./header/drawerMenu.style";
import { Header } from "./header/header";

interface Props {
  children: ReactNode;
}

export const PrivateLayout: FC<Props> = ({ children }) => {
  return (
    <Box sx={{ display: "flex" }}>
      <Header />

      <Container
        component="main"
        maxWidth={false}
        sx={{ padding: 3, overflow: "auto" }}
      >
        <DrawerHeader />

        <Box sx={{ paddingLeft: 0 }}>{children}</Box>
      </Container>
    </Box>
  );
};

export default PrivateLayout;
