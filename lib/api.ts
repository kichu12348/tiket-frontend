import axios from "axios";
import { API_URL } from "@/constants/config";

const api = axios.create({
  baseURL: API_URL, // Assuming backend base url, e.g. http://localhost:3001
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Only access localStorage if in browser environment
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
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
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
