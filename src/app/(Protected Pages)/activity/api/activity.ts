import axios, { AxiosError } from "axios";

const API_BASE_URL = process.env.SERVER_API_BASE_URL || "http://localhost:3000";

interface ApiError {
  message: string;
  status?: number;
  isNetworkError?: boolean;
}

// Fetch all activities
export const fetchActivities = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/activities`, {
      withCredentials: true,
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as any;
      
      const apiError: ApiError = {
        message: data?.message || `Failed to fetch activities (${status})`,
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

// Create new activity
export const createActivity = async (formData: FormData): Promise<any> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/activities/add`,
      formData,
      {
        withCredentials: true,
        timeout: 30000, // 30 seconds for file uploads
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
        message: data?.message || 'Failed to create activity',
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
        message: axiosError.message || 'Failed to create activity',
        isNetworkError: false,
      };
      throw apiError;
    }
  }
};

// Fetch single activity by ID
export const fetchActivityById = async (id: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/activities/${id}`, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching activity:", error);
    throw new Error("Failed to fetch activity details");
  }
};

// Update existing activity
export const updateActivity = async (id: number, activityData: FormData) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/activities/${id}`,
      activityData,
      {
        withCredentials: true,
        timeout: 30000, // 30 seconds for file uploads
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
        message: data?.message || 'Failed to update activity',
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
        message: axiosError.message || 'Failed to update activity',
        isNetworkError: false,
      };
      throw apiError;
    }
  }
};

// Delete activity
export const deleteActivity = async (id: number) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/activities/${id}`, {
      withCredentials: true,
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const data = axiosError.response.data as any;
      const apiError: ApiError = {
        message: data?.message || 'Failed to delete activity',
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
        message: axiosError.message || 'Failed to delete activity',
        isNetworkError: false,
      };
      throw apiError;
    }
  }
};
