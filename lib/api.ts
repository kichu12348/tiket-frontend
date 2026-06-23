import axios from "axios";
import { API_URL, TOKEN_KEY } from "@/constants/config";
import { removeToken } from "@/hooks/useToken";

const api = axios.create({
  baseURL: API_URL, // Assuming backend base url, e.g. http://localhost:3001
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let token: string | null = null;

api.interceptors.request.use(
  async (config) => {
    // Only access localStorage if in browser environment
    if (typeof window !== "undefined") {
      if (!token) {
        token = localStorage.getItem(TOKEN_KEY);
      }
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        await removeToken();
        token = null;
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
