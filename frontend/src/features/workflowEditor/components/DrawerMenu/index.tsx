import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Divider,
  IconButton,
  ListItem,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Drawer,
  DrawerHeader,
} from "components/PrivateLayout/header/drawerMenu.style";
import { type FC, type ReactNode, useState } from "react";

import SidebarAddNode from "./sidebarAddNode";
import SidebarAddAssembledNode from "./sidebarAddAssembledNode";

interface PermanentDrawerRightWorkflowsProps {
  isOpen?: boolean;
  handleClose: () => void;
  children?: ReactNode;
  sidePanel?: ReactNode;
  setOrientation: React.Dispatch<
    React.SetStateAction<"horizontal" | "vertical">
  >;
  orientation: "vertical" | "horizontal";
}

export const PermanentDrawerRightWorkflows: FC<
  PermanentDrawerRightWorkflowsProps
> = ({ setOrientation, orientation }) => {
  const theme = useTheme();
  const [openDrawer, setOpenDrawer] = useState(true);

  return (
    <Box sx={{ overflow: "auto" }}>
      <AppBar
        position="fixed"
        sx={{ backgroundColor: theme.palette.background.paper }}
      >
        <Drawer variant="permanent" anchor="right" open={openDrawer}>
          <DrawerHeader sx={{ marginTop: "4rem" }}>
            {openDrawer && (
              <Typography variant="h1" sx={{ display: "flex", flex: 1 }}>
                Pieces
              </Typography>
            )}
            <IconButton
              onClick={() => {
                setOpenDrawer(!openDrawer);
              }}
              edge="start"
            >
              {openDrawer ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </DrawerHeader>
          {openDrawer && (
            <>
              <Divider />
              <ListItem>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <SidebarAddNode
                    orientation={orientation}
                    setOrientation={setOrientation}
                  />
                </Box>
              </ListItem>
              <Divider />
              <DrawerHeader>
                {openDrawer && (
                  <Typography variant="h1" sx={{ display: "flex", flex: 1 }}>
                    assembled pieces
                  </Typography>
                )}
              </DrawerHeader>
              <Divider />
              <ListItem>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <SidebarAddAssembledNode
                    orientation={orientation}
                    setOrientation={setOrientation}
                  />
                </Box>
              </ListItem>
            </>
          )}
        </Drawer>
      </AppBar>
    </Box>
  );
};
