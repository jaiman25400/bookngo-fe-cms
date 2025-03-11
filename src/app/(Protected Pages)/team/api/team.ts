import axios from "axios";
import api from "@/app/utils/api";

export interface SetPasswordPayload {
  token: string;
  password: string;
}

export type CustomerUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

const API_BASE_URL = process.env.SERVER_API_BASE_URL || "http://localhost:3000";

// Fetch all team members
export const getTeamMembers = async (): Promise<CustomerUser[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/customer-users/getTeam`, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    return response.data?.data;
  } catch (error: any) {
    // Handle 401 Unauthorized error gracefully
    if (error.response && error.response.status === 401) {
      console.warn(
        "Unauthorized access (getTeamMembers). Redirecting to login..."
      );
      return []; // Return empty array to avoid breaking the app
    }

    console.error("API Error (getTeamMembers):", error);
    throw error; // Re-throw other errors for further handling
  }
};

// Invite a team member
export const inviteTeamMembers = async (formData: {
  name: string;
  email: string;
  role: string;
}) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/customer-users/invite`,
      formData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Add Team Res :", response);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Sends a request to set a user's password.
 * @param payload - Contains the token and new password.
 */
export const setUserPassword = async (payload: SetPasswordPayload) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/customer-users/set-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to set password.");
    }

    return await response.json();
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "An unknown error occurred."
    );
  }
};
