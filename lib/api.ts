import axios, { type InternalAxiosRequestConfig } from "axios";
import { getToken, removeToken } from "./auth";

export type ApiError = {
  status: number | null;
  message: string;
  details?: unknown;
};

const DEFAULT_API_URL = "http://localhost:3001";
// Ensure API URL is properly set - use environment variable or fallback to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.trim() 
  : DEFAULT_API_URL;

console.log('[API] Base URL:', API_BASE_URL);

const isBrowser = () => typeof window !== "undefined";

const redirectToLogin = () => {
  if (!isBrowser()) {
    return;
  }

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

const normalizeApiError = (error: unknown): ApiError => {
  if (!axios.isAxiosError(error)) {
    return {
      status: null,
      message: error instanceof Error ? error.message : "Une erreur est survenue",
      details: error
    };
  }

  const data = error.response?.data as { message?: string; error?: string } | undefined;

  return {
    status: error.response?.status ?? null,
    message:
      data?.message ||
      data?.error ||
      error.message ||
      "Une erreur est survenue",
    details: error.response?.data
  };
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = normalizeApiError(error);

    if (apiError.status === 401) {
      removeToken();
      redirectToLogin();
    }

    return Promise.reject(apiError);
  }
);

export default api;
