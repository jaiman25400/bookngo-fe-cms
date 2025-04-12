import axios from "axios";
import {
  InventoryItem,
  UpdateInventoryItem,
  CreateInventoryItem,
} from "../types/InventoryTypes";

const API_BASE_URL = process.env.SERVER_API_BASE_URL || "http://localhost:3000";

// Fetch all inventory items
export const fetchInventories = async (): Promise<InventoryItem[]> => {
  try {
    console.log("Fetching inventory");
    const response = await axios.get(`${API_BASE_URL}/inventory`, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    console.log("Fetcg Inv:", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory:", error);
    throw new Error("Failed to fetch inventory");
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
    console.log("UPDATE INV  API");
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
    const response = await axios.put(
      `${API_BASE_URL}/inventory/${id}`,
      formData,
      {
        withCredentials: true, // Ensure cookies are sent with the request
      }
    );
    console.log("Response Update DATA :", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating inventory:", error);
    throw new Error("Failed to update inventory");
  }
};

// Delete inventory item
export const deleteInventory = async (id: number): Promise<void> => {
  if (!id) {
    console.warn("No Inventory ID provided. Skipping delete request.");
    return;
  }

  try {
    await axios.delete(`${API_BASE_URL}/inventory/${id}`, {
      withCredentials: true, // Ensure cookies are sent with the request
    }); // 🔄 Send ID as query param
  } catch (error) {
    console.error("Error deleting inventory:", error);
    throw new Error("Failed to delete inventory");
  }
};
