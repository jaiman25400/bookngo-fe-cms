// utils/api.ts
import axios from "axios";

/** Base URL for BookNGo API (browser + server bundle). */
export const CMS_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.SERVER_API_BASE_URL ||
  "http://localhost:3000";

const api = axios.create({
  baseURL: CMS_API_BASE_URL,
  withCredentials: true,
});

/** Legacy key from an older JWT-in-localStorage flow; cleared on logout / 401. */
export const CMS_TOKEN_KEY = "cms_token";

function clearLegacyCmsTokenStorage(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CMS_TOKEN_KEY);
    window.sessionStorage.removeItem(CMS_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** Clear client state and go to login when API returns 401 (cookie expired / invalid). */
function redirectToLoginIfUnauthorized(error: unknown): boolean {
  if (typeof window === "undefined") return false;
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status !== 401) return false;

  clearLegacyCmsTokenStorage();
  delete axios.defaults.headers.common.Authorization;
  delete api.defaults.headers.common.Authorization;

  const path = window.location.pathname;
  if (!path.startsWith("/login") && !path.startsWith("/setup-password")) {
    window.location.replace("/login");
  }
  return true;
}

/**
 * CMS auth is httpOnly cookie `token` on the API host. JS cannot read it;
 * use this to see if the cookie session is valid.
 */
export async function checkCmsAuthSession(): Promise<
  "authenticated" | "unauthenticated" | "error"
> {
  try {
    const res = await axios.get(`${CMS_API_BASE_URL}/auth/me`, {
      withCredentials: true,
      timeout: 10000,
      validateStatus: (s) => s >= 200 && s < 600,
    });
    if (res.status === 200) return "authenticated";
    if (res.status === 401 || res.status === 403) return "unauthenticated";
    return "error";
  } catch {
    return "error";
  }
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
      return Promise.reject({
        message: error.response.data?.message || "An error occurred",
        status: error.response.status,
        data: error.response.data,
      });
    }

    if (error.request) {
      return Promise.reject({
        message: "Network error - please check your connection",
        status: 0,
      });
    }

    return Promise.reject({
      message: error.message || "An unexpected error occurred",
      status: 500,
    });
  }
);

export default api;
