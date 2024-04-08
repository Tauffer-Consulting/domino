import axios from "axios";
import { dispatchLogout } from "context/authentication";

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
    if (error?.response?.status === 401) {
      dispatchLogout();
    }

    console.log(error);

    return await Promise.reject(error);
  },
);
