import axios, { AxiosError } from "axios";
import { ProfileData } from "../types/profileTypes";

const API_BASE_URL = process.env.SERVER_API_BASE_URL || "http://localhost:3000";

interface ApiError {
  message: string;
  status?: number;
  isNetworkError?: boolean;
}

export const fetchProfileData = async (): Promise<ProfileData> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/customers/profile`, {
      withCredentials: true,
      timeout: 10000,
    });
    return response.data || {};
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as any;
      
      const apiError: ApiError = {
        message: data?.message || `Failed to fetch profile (${status})`,
        status,
        isNetworkError: false,
      };
      throw apiError;
    } else if (axiosError.request) {
      const apiError: ApiError = {
        message: 'Unable to connect to the server. Please check your connection.',
        isNetworkError: true,
      };
      throw apiError;
    } else {
      const apiError: ApiError = {
        message: axiosError.message || 'An unexpected error occurred.',
        isNetworkError: false,
      };
      throw apiError;
    }
  }
};

export const createProfileData = async (formData: FormData): Promise<any> => {
  // Changed to single object
  try {
    // Log formData entries
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
    const response = await axios.post(
      `${API_BASE_URL}/customers/profile`,
      formData,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating profile:", error);
    throw new Error("Failed to create profile");
  }
};

export const updateProfileData = async (formData: FormData): Promise<any> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/customers/profile`,
      formData,
      {
        withCredentials: true,
        timeout: 30000,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const data = axiosError.response.data as any;
      const apiError: ApiError = {
        message: data?.message || 'Failed to update profile',
        status: axiosError.response.status,
        isNetworkError: false,
      };
      throw apiError;
    } else if (axiosError.request) {
      const apiError: ApiError = {
        message: 'Network error. Please check your connection.',
        isNetworkError: true,
      };
      throw apiError;
    } else {
      const apiError: ApiError = {
        message: axiosError.message || 'Failed to update profile',
        isNetworkError: false,
      };
      throw apiError;
    }
  }
};

