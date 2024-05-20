import { AuthenticationProvider } from "@context/authentication";
import { StorageProvider } from "@context/storage/useStorage";
import { ColorModeProvider } from "@context/theme";
import { queryClient } from "@services/clients/react-query.client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type FC } from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AppRoutes } from "../routes";

export const App: FC = () => (
  <StorageProvider>
    <ColorModeProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
        <BrowserRouter>
          <AuthenticationProvider>
            <AppRoutes />
          </AuthenticationProvider>
        </BrowserRouter>
      </QueryClientProvider>
      <ToastContainer />
    </ColorModeProvider>
  </StorageProvider>
);

export default App;
