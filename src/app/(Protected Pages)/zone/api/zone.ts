import axios from "axios";
import { Zone } from "../types/ZoneTypes";
import { CreateZone } from "../types/ZoneTypes";

const API_URL = "http://localhost:3000/activity-zones"; // Replace with actual API URL

// Fetch all zones
export const fetchZones = async (): Promise<Zone[]> => {
  try {
    console.log("Fetch Zone");
    const response = await axios.get(API_URL, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    console.log("Fetch Zone Data ", response);

    return response.data;
  } catch (error) {
    console.error("Error fetching zones:", error);
    throw new Error("Failed to fetch zones");
  }
};

// Add new zone
export const addZone = async (CreateZone: CreateZone): Promise<CreateZone> => {
  try {
    console.log("Create Zone :", CreateZone);
    const response = await axios.post(`${API_URL}/add`, CreateZone, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    return response.data;
  } catch (error) {
    console.error("Error adding zone:", error);
    throw new Error("Failed to add zone");
  }
};

// Update existing zone
export const updateZone = async (
  id: number,
  zone: Partial<Zone>
): Promise<Zone> => {
  try {
    // Send a PATCH request for partial updates (more RESTful)
    const response = await axios.patch(`${API_URL}/${id}`, zone, {
      withCredentials: true, // Ensure cookies are sent with the request
    });

    return response.data;
  } catch (error) {
    console.error("Error updating zone:", error);

    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Failed to update zone");
    }

    throw new Error("Unknown error occurred");
  }
};
// Delete zone
export const deleteZone = async (id: number): Promise<void> => {
  if (!id) {
    console.warn("No Zone ID provided. Skipping delete request.");
    return;
  }

  try {
    await axios.delete(`${API_URL}/${id}`, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
  } catch (error) {
    console.error("Error deleting zone:", error);
    throw new Error("Failed to delete zone");
  }
};
