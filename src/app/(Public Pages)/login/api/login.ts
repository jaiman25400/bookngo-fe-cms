import axios, { AxiosError } from "axios";
import api, { CMS_TOKEN_KEY } from "@/app/utils/api";

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

function pickTokenFromObject(obj: Record<string, unknown> | undefined) {
  if (!obj) return undefined;
  const v = obj.accessToken ?? obj.access_token ?? obj.token ?? obj.jwt;
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

/** Backend may return JWT at root, under `data`, `data.user`, or `data.tokens`. */
function extractAccessToken(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const root = payload as Record<string, unknown>;
  const fromRoot = pickTokenFromObject(root);
  if (fromRoot) return fromRoot;

  const inner = root.data;
  if (!inner || typeof inner !== "object") return undefined;
  const data = inner as Record<string, unknown>;
  const fromData = pickTokenFromObject(data);
  if (fromData) return fromData;

  const user = data.user;
  if (user && typeof user === "object") {
    const fromUser = pickTokenFromObject(user as Record<string, unknown>);
    if (fromUser) return fromUser;
  }

  const tokens = data.tokens;
  if (tokens && typeof tokens === "object") {
    const fromTokens = pickTokenFromObject(tokens as Record<string, unknown>);
    if (fromTokens) return fromTokens;
  }

  return undefined;
}

function persistCmsToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CMS_TOKEN_KEY, token);
    return;
  } catch {
    /* localStorage blocked or full */
  }
  try {
    window.sessionStorage.setItem(CMS_TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
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

    const token = extractAccessToken(data);

    if (typeof window !== "undefined") {
      if (token) {
        persistCmsToken(token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        // eslint-disable-next-line no-console
        console.log("[Login] Token stored and set on axios defaults");
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          "[Login] No JWT in login response body; AuthGate requires cms_token. Check API JSON shape or use cookie + /me flow."
        );
      }
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
