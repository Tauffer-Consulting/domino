import { Box } from "@mui/material";
import { type FC, useState } from "react";

import { DrawerMenu } from "./drawerMenu";

export const Header: FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Box sx={{ height: 64 }}>
        <DrawerMenu
          isOpen={menuOpen}
          handleClose={() => {
            setMenuOpen(!menuOpen);
          }}
        />
      </Box>
    </>
  );
};
