import { AuthenticationProvider } from "@context/authentication";
import { StorageProvider } from "@context/storage/useStorage";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { queryClient } from "@services/clients/react-query.client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type FC } from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AppRoutes } from "../routes";

import { theme } from "./theme.config";

export const App: FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      <BrowserRouter>
        <StorageProvider>
          <AuthenticationProvider>
            <AppRoutes />
          </AuthenticationProvider>
        </StorageProvider>
      </BrowserRouter>
    </QueryClientProvider>
    <ToastContainer />
  </ThemeProvider>
);

export default App;
