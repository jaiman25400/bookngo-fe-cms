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
  const v =
    obj.accessToken ??
    obj.access_token ??
    obj.token ??
    obj.jwt ??
    obj.authToken ??
    obj.auth_token ??
    obj.sessionToken ??
    obj.session_token ??
    obj.bearerToken ??
    obj.bearer_token;
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

/** Three dot-separated base64url segments — catches JWTs under any JSON key. */
function isLikelyJwt(value: string): boolean {
  if (value.length < 40) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  return parts.every((p) => p.length >= 4);
}

/**
 * Walk the JSON tree: known token fields first per object, then recurse.
 * Handles wrappers like `{ user: {...} }`, `{ result: { token } }`, not only `data`.
 */
function findTokenInValue(value: unknown, depth: number): string | undefined {
  if (depth > 10) return undefined;
  if (value === null || value === undefined) return undefined;

  if (typeof value === "string") {
    return isLikelyJwt(value) ? value : undefined;
  }

  if (typeof value !== "object") return undefined;

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findTokenInValue(item, depth + 1);
      if (found) return found;
    }
    return undefined;
  }

  const obj = value as Record<string, unknown>;
  const direct = pickTokenFromObject(obj);
  if (direct) return direct;

  for (const key of Object.keys(obj)) {
    const found = findTokenInValue(obj[key], depth + 1);
    if (found) return found;
  }
  return undefined;
}

function extractAccessToken(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  return findTokenInValue(payload, 0);
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

    let token = extractAccessToken(data);

    if (!token) {
      const rawAuth =
        response.headers["authorization"] ??
        (response.headers as Record<string, string | undefined>)["Authorization"];
      if (typeof rawAuth === "string") {
        const m = rawAuth.match(/^Bearer\s+(\S+)/i);
        if (m?.[1]) token = m[1];
      }
    }

    if (typeof window !== "undefined") {
      if (token) {
        persistCmsToken(token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        // eslint-disable-next-line no-console
        console.log("[Login] Token stored and set on axios defaults");
      } else {
        const topKeys =
          data && typeof data === "object" && !Array.isArray(data)
            ? Object.keys(data as object).join(", ")
            : "(non-object)";
        // eslint-disable-next-line no-console
        console.warn(
          "[Login] No JWT found in JSON. Top-level keys:",
          topKeys,
          "— CMS needs accessToken (or similar) in the body, or httpOnly session + /auth/me."
        );
        const loginError: LoginError = {
          message:
            "Signed in on the server, but no access token was returned for this app. Your API must include a JWT in the login JSON (recommended: accessToken) or the CMS must be updated for cookie-only sessions.",
          status: response.status,
          isNetworkError: false,
        };
        throw loginError;
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
