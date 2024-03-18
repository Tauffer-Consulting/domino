import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { AuthenticationProvider } from "context/authentication";
import { StorageProvider } from "context/storage/useStorage";
import { type FC } from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SWRConfig } from "swr";

import { AppRoutes } from "../routes";

import { theme } from "./theme.config";

export const App: FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <SWRConfig value={{ errorRetryCount: 2 }} />
    <BrowserRouter>
      <StorageProvider>
        <AuthenticationProvider>
          <AppRoutes />
        </AuthenticationProvider>
      </StorageProvider>
    </BrowserRouter>
    <ToastContainer />
  </ThemeProvider>
);

export default App;
