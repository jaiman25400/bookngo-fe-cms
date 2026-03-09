import axios, { AxiosError } from "axios";
import { Zone } from "../types/ZoneTypes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.SERVER_API_BASE_URL ||
  "http://localhost:3000";

interface ApiError {
  message: string;
  status?: number;
  isNetworkError?: boolean;
}

// Fetch all zones
export const fetchZones = async (): Promise<Zone[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/activity-zones`, {
      withCredentials: true,
      timeout: 10000,
    });
    return response.data || [];
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as any;
      
      const apiError: ApiError = {
        message: data?.message || `Failed to fetch zones (${status})`,
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

// Add new zone
export const addZone = async (formData: FormData): Promise<any> => {
  try {
    // In handleSubmit before axios call
    console.log("FormData contents:");
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
      formData;
    }
    const response = await axios.post(
      `${API_BASE_URL}/activity-zones/add`,
      formData,
      {
        withCredentials: true,
      }
    );
    console.log('Res we got :',response)
    return response.data;
  } catch (error:any) {
    // Extract backend error message
    const errorMessage = error.response?.data?.message 
      || error.message 
      || "Failed to add zone";

    // Throw as Error object with proper message
    throw new Error(errorMessage);
  }
};

// Update existing zone
export const updateZone = async (
  id: number,
  formData: FormData
): Promise<Zone> => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/activity-zones/${id}`,
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
        message: data?.message || 'Failed to update zone',
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
        message: axiosError.message || 'Failed to update zone',
        isNetworkError: false,
      };
      throw apiError;
    }
  }
};

// Delete zone
export const deleteZone = async (id: number): Promise<void> => {
  if (!id) {
    throw new Error("No Zone ID provided.");
  }

  try {
    await axios.delete(`${API_BASE_URL}/activity-zones/${id}`, {
      withCredentials: true,
      timeout: 10000,
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const data = axiosError.response.data as any;
      const apiError: ApiError = {
        message: data?.message || 'Failed to delete zone',
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
        message: axiosError.message || 'Failed to delete zone',
        isNetworkError: false,
      };
      throw apiError;
    }
  }
};
