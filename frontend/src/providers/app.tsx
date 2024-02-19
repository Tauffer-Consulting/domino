import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { AuthenticationProvider } from "context/authentication";
import { StorageProvider } from "context/storage/useStorage";
import { WorkspacesProvider } from "context/workspaces";
import PiecesProvider from "context/workspaces/repositories";
import { type FC } from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SWRConfig } from "swr";

import ApplicationRoutes from "../routes";

import { theme } from "./theme.config";

/**
 * @todo add more things such as Toast Container and Auth Provider
 * @returns
 */
export const App: FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <SWRConfig value={{ errorRetryCount: 2 }} />
    <BrowserRouter>
      <StorageProvider>
        <AuthenticationProvider>
          <WorkspacesProvider>
            <PiecesProvider>
              <ApplicationRoutes />
            </PiecesProvider>
          </WorkspacesProvider>
        </AuthenticationProvider>
      </StorageProvider>
    </BrowserRouter>
    <ToastContainer />
  </ThemeProvider>
);

export default App;
