import axios, { AxiosError } from "axios";
import api from "@/app/utils/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.SERVER_API_BASE_URL ||
  "http://localhost:3000";

// Debug: log which base URL login is using (will show in browser console)
if (typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.log("[Login] API_BASE_URL =", API_BASE_URL);
}

interface LoginError {
  message: string;
  status?: number;
  isNetworkError?: boolean;
}

export const loginUser = async (email: string, password: string) => {
  try {
    // eslint-disable-next-line no-console
    console.log("[Login] Sending login request", {
      baseURL: API_BASE_URL,
      email,
    });

    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      { email, password },
      { 
        withCredentials: true, // Sends and receives cookies
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    const data = response.data as any;
    // eslint-disable-next-line no-console
    console.log("[Login] Response received", {
      status: response.status,
      dataKeys: data && typeof data === "object" ? Object.keys(data) : typeof data,
    });

    const token =
      data?.accessToken ||
      data?.access_token ||
      data?.token;

    // Persist token client-side and attach as Authorization header
    if (token && typeof window !== "undefined") {
      try {
        window.localStorage.setItem("cms_token", token);
        // eslint-disable-next-line no-console
        console.log("[Login] Token stored in localStorage and set on axios defaults");
      } catch {
        // ignore storage errors
      }
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    return data; // Return the response payload
  } catch (error) {
    const axiosError = error as AxiosError;
    
    // Enhanced error handling
    if (axiosError.response) {
      // Server responded with error status
      const status = axiosError.response.status;
      const data = axiosError.response.data as any;
      
      const loginError: LoginError = {
        message: data?.message || `Server error (${status})`,
        status,
        isNetworkError: false,
      };
      
      throw loginError;
    } else if (axiosError.request) {
      // Request was made but no response received (network error)
      const loginError: LoginError = {
        message: 'Unable to connect to the server. Please check your internet connection and ensure the backend server is running.',
        isNetworkError: true,
      };
      
      throw loginError;
    } else {
      // Something else happened
      const loginError: LoginError = {
        message: axiosError.message || 'An unexpected error occurred. Please try again.',
        isNetworkError: false,
      };
      
      throw loginError;
    }
  }
};
