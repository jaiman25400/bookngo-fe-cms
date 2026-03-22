// utils/api.ts
import axios, { type InternalAxiosRequestConfig } from "axios";

// Prefer public URL so it is available in the browser bundle,
// but still fall back to server-only env for SSR if needed.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.SERVER_API_BASE_URL ||
  'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const CMS_TOKEN_KEY = "cms_token";

function readCmsTokenFromBrowserStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return (
      window.localStorage.getItem(CMS_TOKEN_KEY) ||
      window.sessionStorage.getItem(CMS_TOKEN_KEY)
    );
  } catch {
    return null;
  }
}

function clearCmsTokenFromBrowserStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CMS_TOKEN_KEY);
    window.sessionStorage.removeItem(CMS_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** Clear session and go to login when API returns 401 (expired / invalid token). */
function redirectToLoginIfUnauthorized(error: unknown): boolean {
  if (typeof window === "undefined") return false;
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status !== 401) return false;

  clearCmsTokenFromBrowserStorage();
  delete axios.defaults.headers.common.Authorization;
  delete api.defaults.headers.common.Authorization;

  const path = window.location.pathname;
  if (!path.startsWith("/login") && !path.startsWith("/setup-password")) {
    window.location.replace("/login");
  }
  return true;
}

// Debug: log the API base URL on the client
if (typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.log("[API] Base URL =", API_BASE_URL);
}

// Attach Authorization from storage on the client (module load).
if (typeof window !== "undefined") {
  const token = readCmsTokenFromBrowserStorage();
  if (token) {
    const bearer = `Bearer ${token}`;
    api.defaults.headers.common["Authorization"] = bearer;
    axios.defaults.headers.common["Authorization"] = bearer;
    // eslint-disable-next-line no-console
    console.log("[API] Authorization header set from stored token");
  }
}

function attachBearerFromStorage(config: InternalAxiosRequestConfig) {
  const token = readCmsTokenFromBrowserStorage();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
}

// Per-request: dashboard and other modules use raw `axios`; defaults alone can miss
// the token after login. Always merge Bearer from storage before each request.
let axiosInterceptorsRegistered = false;
if (typeof window !== "undefined" && !axiosInterceptorsRegistered) {
  axiosInterceptorsRegistered = true;
  axios.interceptors.request.use(attachBearerFromStorage);
  api.interceptors.request.use(attachBearerFromStorage);
}

// Same-origin CMS calls also use the default `axios` instance (e.g. dashboard.ts).
let axios401Registered = false;
if (typeof window !== "undefined" && !axios401Registered) {
  axios401Registered = true;
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (redirectToLoginIfUnauthorized(error)) {
        return Promise.reject(error);
      }
      return Promise.reject(error);
    }
  );
}

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (redirectToLoginIfUnauthorized(error)) {
      return Promise.reject(error);
    }
    // eslint-disable-next-line no-console
    console.error("[API] Request error", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response) {
      // Handle HTTP errors with responses
      return Promise.reject({
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data
      });
    }
    
    if (error.request) {
      // Handle network errors
      return Promise.reject({
        message: 'Network error - please check your connection',
        status: 0
      });
    }

    // Handle other errors
    return Promise.reject({
      message: error.message || 'An unexpected error occurred',
      status: 500
    });
  }
);

export default api;