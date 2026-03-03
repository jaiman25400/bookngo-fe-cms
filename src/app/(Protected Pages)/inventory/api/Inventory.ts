import axios, { AxiosError } from "axios";
import {
  InventoryItem,
  UpdateInventoryItem,
  CreateInventoryItem,
} from "../types/InventoryTypes";

const API_BASE_URL = process.env.SERVER_API_BASE_URL || "http://localhost:3000";

interface ApiError {
  message: string;
  status?: number;
  isNetworkError?: boolean;
}

// Fetch all inventory items
export const fetchInventories = async (): Promise<InventoryItem[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/inventory`, {
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
        message: data?.message || `Failed to fetch inventory (${status})`,
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

// Add new inventory item
export const addInventory = async (formData: FormData): Promise<any> => {
  try {
    console.log("Add Inventory Form DAta :", formData);
    const response = await axios.post(
      `${API_BASE_URL}/inventory/add`,
      formData,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding inventory:", error);
    throw new Error("Failed to add inventory");
  }
};

// Update existing inventory item
export const updateInventory = async (
  id: number,
  formData: any
): Promise<InventoryItem> => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/inventory/${id}`,
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
        message: data?.message || 'Failed to update inventory',
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
        message: axiosError.message || 'Failed to update inventory',
        isNetworkError: false,
      };
      throw apiError;
    }
  }
};

// Delete inventory item
export const deleteInventory = async (id: number): Promise<void> => {
  if (!id) {
    throw new Error("No Inventory ID provided.");
  }

  try {
    await axios.delete(`${API_BASE_URL}/inventory/${id}`, {
      withCredentials: true,
      timeout: 10000,
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const data = axiosError.response.data as any;
      const apiError: ApiError = {
        message: data?.message || 'Failed to delete inventory',
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
        message: axiosError.message || 'Failed to delete inventory',
        isNetworkError: false,
      };
      throw apiError;
    }
  }
};
