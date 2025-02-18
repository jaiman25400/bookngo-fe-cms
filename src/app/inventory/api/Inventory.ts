import axios from "axios";
import { InventoryItem, UpdateInventoryItem } from "../types/InventoryTypes";

const API_URL = "http://localhost:3000/inventory"; // Replace with actual API URL

// Fetch all inventory items
export const fetchInventories = async (customer_id?: number): Promise<InventoryItem[]> => {
  if (!customer_id) {
    console.warn("No customer ID provided. Skipping API call.");
    return [];
  }

  try {
    console.log("Fetching inventory for customer_id:", customer_id);
    const response = await axios.get(`${API_URL}?customer_id=${customer_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory:", error);
    throw new Error("Failed to fetch inventory");
  }
};


// Add new inventory item
export const addInventory = async (
  inventory: Omit<InventoryItem, "id">
): Promise<InventoryItem> => {
  try {
    const response = await axios.post(API_URL, inventory);
    return response.data;
  } catch (error) {
    console.error("Error adding inventory:", error);
    throw new Error("Failed to add inventory");
  }
};

// Update existing inventory item
export const updateInventory = async (
  id: number,
  inventory: UpdateInventoryItem
): Promise<InventoryItem> => {
  try {
    console.log("UPDATE INV ", id, inventory);
    const response = await axios.put(`${API_URL}/${id}`, inventory);
    console.log("Response Update DATA :", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating inventory:", error);
    throw new Error("Failed to update inventory");
  }
};

// Delete inventory item
export const deleteInventory = async (id: number, customer_id: number): Promise<void> => {
  if (!customer_id) {
    console.warn("No customer ID provided. Skipping delete request.");
    return;
  }

  try {
    await axios.delete(`${API_URL}/${id}?customer_id=${customer_id}`); // 🔄 Send customer_id as query param
  } catch (error) {
    console.error("Error deleting inventory:", error);
    throw new Error("Failed to delete inventory");
  }
};

