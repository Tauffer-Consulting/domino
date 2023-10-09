import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { AuthenticationProvider } from "context/authentication";
import { WorkspacesProvider } from "context/workspaces";
import { type FC } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SWRConfig } from "swr";

import ApplicationRoutes from "../routes";

import { theme } from "./theme.config";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";

/**
 * @todo add more things such as Toast Container and Auth Provider
 * @returns
 */
export const App: FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <SWRConfig value={{ errorRetryCount: 2 }} />
    <BrowserRouter>
      <AuthenticationProvider>
        <WorkspacesProvider>
          <ApplicationRoutes />
        </WorkspacesProvider>
      </AuthenticationProvider>
    </BrowserRouter>
    <ToastContainer />
  </ThemeProvider>
);

export default App;
