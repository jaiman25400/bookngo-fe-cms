import axios, { AxiosError } from "axios";
import { CMS_API_BASE_URL } from "@/app/utils/api";

interface LoginError {
  message: string;
  status?: number;
  isNetworkError?: boolean;
}

/**
 * BookNGo API: POST /auth/login returns `{ message: "Login successful" }` and sets
 * httpOnly cookie `token` on the API host. JwtAuthGuard reads the cookie only (no Bearer).
 */
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(
      `${CMS_API_BASE_URL}/auth/login`,
      { email, password },
      {
        withCredentials: true,
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
        validateStatus: (s) => s >= 200 && s < 500,
      }
    );

    if (response.status === 401 || response.status === 403) {
      const data = response.data as { message?: string };
      throw {
        message: data?.message || "Invalid email or password.",
        status: response.status,
        isNetworkError: false,
      } satisfies LoginError;
    }

    if (response.status >= 400) {
      const data = response.data as { message?: string };
      throw {
        message: data?.message || `Login failed (${response.status})`,
        status: response.status,
        isNetworkError: false,
      } satisfies LoginError;
    }

    const me = await axios.get(`${CMS_API_BASE_URL}/auth/me`, {
      withCredentials: true,
      timeout: 10000,
      validateStatus: (s) => s >= 200 && s < 600,
    });

    if (me.status !== 200) {
      throw {
        message:
          "The server accepted your password, but the session cookie was not sent or saved. Check that the API sets the `token` cookie with SameSite=None and Secure in production, and that CMS_FRONTEND_URL includes https://admin.bookngo.ca for CORS.",
        status: me.status,
        isNetworkError: false,
      } satisfies LoginError;
    }

    return response.data;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      "isNetworkError" in error
    ) {
      throw error;
    }

    const axiosError = error as AxiosError;

    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as { message?: string };

      throw {
        message: data?.message || `Server error (${status})`,
        status,
        isNetworkError: false,
      } satisfies LoginError;
    }

    if (axiosError.request) {
      throw {
        message:
          "Unable to connect to the server. Please check your internet connection and ensure the backend is reachable.",
        isNetworkError: true,
      } satisfies LoginError;
    }

    throw {
      message: axiosError.message || "An unexpected error occurred. Please try again.",
      isNetworkError: false,
    } satisfies LoginError;
  }
};
