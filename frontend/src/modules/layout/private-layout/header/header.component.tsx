import { Box } from "@mui/material";
import { type FC, useRef, useState } from "react";

import { DrawerMenu } from "./drawer-menu.component";

export const Header: FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const barHeight = useRef<HTMLDivElement>(null);

  return (
    <>
      <Box sx={{ height: barHeight.current?.clientHeight ?? 64 }}>
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
