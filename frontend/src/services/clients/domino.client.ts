import axios from "axios";
import { environment } from "config/environment.config";
import { dispatchLogout } from "context/authentication";

import { endpoints } from "../config/endpoints.config";

import { dominoMock } from "./domino.mock";

export const dominoApiClient = axios.create({
  baseURL: endpoints?.api ?? "",
});

if (environment.USE_MOCK) {
  console.info(
    "⚠ info: using mock for requests, they may be out of sync with current backend development",
  );
  dominoMock();
}

/**
 * @todo handle unauthorized and other useful status codes
 */
dominoApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) {
      dispatchLogout();
    }
    return await Promise.reject(error);
  },
);

// Set header from storage on each request using interceptors
dominoApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  async (error) => {
    return await Promise.reject(error);
  },
);
