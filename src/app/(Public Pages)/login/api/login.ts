import axios, { AxiosError } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.SERVER_API_BASE_URL ||
  "http://localhost:3000";

interface LoginError {
  message: string;
  status?: number;
  isNetworkError?: boolean;
}

export const loginUser = async (email: string, password: string) => {
  try {
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

    return response.data; // Return the response payload
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
