// utils/api.ts
import axios from 'axios';

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

// Debug: log the API base URL on the client
if (typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.log("[API] Base URL =", API_BASE_URL);
}

// Attach Authorization header from localStorage token on the client,
// so backend can also read JWT from Authorization if needed.
if (typeof window !== "undefined") {
  const token = window.localStorage.getItem("cms_token");
  if (token) {
    const bearer = `Bearer ${token}`;
    api.defaults.headers.common["Authorization"] = bearer;
    axios.defaults.headers.common["Authorization"] = bearer;
    // eslint-disable-next-line no-console
    console.log("[API] Authorization header set from localStorage token");
  }
}

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
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