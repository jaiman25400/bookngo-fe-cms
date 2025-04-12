import axios from "axios";

const API_BASE_URL = process.env.SERVER_API_BASE_URL || "http://localhost:3000";

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      { email, password },
      { withCredentials: true } // Sends and receives cookies
    );

    return response.data; // Return the response payload
  } catch (error: any) {
    console.error("Login Error:", error);
    throw new Error(
      error.response?.data?.message || "Something went wrong. Please try again."
    );
  }
};
