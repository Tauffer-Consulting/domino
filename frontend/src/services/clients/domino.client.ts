import axios from "axios";
import { dispatchLogout } from "context/authentication";
import { toast } from "react-toastify";

import { endpoint } from "../config/endpoints.config";

export const dominoApiClient = axios.create({
  baseURL: endpoint,
});

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

dominoApiClient.interceptors.response.use(
  (response) => response.data,
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
      toast.error(message[0].msg, {
        toastId: message[0].msg,
      });
    } else {
      toast.error(message, {
        toastId: message,
      });
    }

    return await Promise.reject(error);
  },
);
