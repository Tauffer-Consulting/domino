import { useColorMode } from "@context/theme";
import {
  AccountTree as AccountTreeIcon,
  BlurCircular,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Toc,
  Workspaces,
  Brightness4,
  Brightness7,
  BrightnessAuto,
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Box,
  Divider,
  IconButton,
  List,
  Toolbar,
  Tooltip,
  useTheme,
} from "@mui/material";
import { useAuthentication } from "context/authentication";
import { useWorkspaces } from "context/workspaces";
import { type FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { AppBar, Drawer, DrawerHeader } from "./drawerMenu.style";
import { DrawerMenuItem } from "./drawerMenuItem";

interface IDrawerMenuProps {
  isOpen: boolean;
  handleClose: () => void;
}

/**
 * Drawer menu.
 * TODO move AppBar into its own component (or to header.component)
 */
export const DrawerMenu: FC<IDrawerMenuProps> = ({ isOpen, handleClose }) => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();
  const { logout } = useAuthentication();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { workspace } = useWorkspaces();

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleClose}>
            {theme.direction === "rtl" ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <img
            src="/assets/main_logo_white.png"
            alt="logo"
            style={{ width: "190px", marginRight: "8px", marginLeft: "20px" }}
          />
          <IconButton
            component="p"
            sx={{
              color: "inherit",
              fontSize: "1.2rem",
              fontWeight: 100,
              ml: "auto",
              alignItems: "center",
              display: { xs: "none", md: "flex" },
            }}
            onClick={() => {
              if (workspace) {
                navigate("/workspaces/settings");
              }
            }}
          >
            <BlurCircular
              sx={{
                mr: 1,
              }}
            />
            {workspace?.workspace_name
              ? workspace?.workspace_name
              : "No workspace selected"}
          </IconButton>
          <Tooltip
            title={
              mode === "auto"
                ? "Auto"
                : mode === "light"
                  ? " Light mode"
                  : "Dark mode"
            }
          >
            <IconButton
              sx={{ ml: 1 }}
              onClick={toggleColorMode}
              color="inherit"
            >
              {mode === "dark" ? (
                <Brightness4 />
              ) : mode === "light" ? (
                <Brightness7 />
              ) : (
                <BrightnessAuto />
              )}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={isOpen}>
        <DrawerHeader>
          <IconButton onClick={handleClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List disablePadding>
          <DrawerMenuItem
            selected={pathname === "/workspaces"}
            onClick={() => {
              navigate("/workspaces");
            }}
            icon={<Workspaces />}
            label={"Workspaces"}
            isMenuOpen={isOpen}
          />
        </List>
        <Divider />
        <List>
          <DrawerMenuItem
            selected={pathname === "/my-workflows"}
            onClick={() => {
              if (workspace?.id) navigate("/my-workflows");
            }}
            icon={<Toc />}
            label={"My Workflows"}
            isMenuOpen={isOpen}
            disabled={!workspace?.id}
          />

          <DrawerMenuItem
            selected={pathname === "/workflows-editor"}
            onClick={() => {
              if (workspace?.id) navigate("/workflows-editor");
            }}
            icon={<AccountTreeIcon />}
            label={"Workflow Editor"}
            isMenuOpen={isOpen}
            disabled={!workspace?.id}
          />
        </List>
        <Divider />
        <List>
          <DrawerMenuItem
            selected={pathname === "/profile"}
            onClick={() => {
              // navigate("/profile");
            }}
            icon={<PersonIcon />}
            label={"Profile"}
            isMenuOpen={isOpen}
            disabled
          />
          <DrawerMenuItem
            selected={false}
            onClick={() => {
              logout();
            }}
            icon={<LogoutIcon />}
            label={"Logout"}
            isMenuOpen={isOpen}
          />
        </List>
      </Drawer>
    </Box>
  );
};
