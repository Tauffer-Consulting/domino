import axios from "axios";
import { dispatchLogout } from "context/authentication";
import { toast } from "react-toastify";

import { endpoint } from "../config/endpoints.config";

export const dominoApiClient = axios.create({
  baseURL: endpoint,
});

/**
 * @todo handle unauthorized and other useful status codes
 */
dominoApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) {
      dispatchLogout();
    }

    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error?.message ||
      "Something went wrong";

    if (Array.isArray(message)) {
      toast.error(message[0].msg);
    } else {
      toast.error(message);
    }

    return await Promise.reject(error);
  },
);

dominoApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  async (error) => {
    return await Promise.reject(error);
  },
);
