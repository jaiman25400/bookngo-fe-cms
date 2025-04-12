import axios from "axios";
import { Zone } from "../types/ZoneTypes";

const API_BASE_URL = process.env.SERVER_API_BASE_URL || "http://localhost:3000";

// Fetch all zones
export const fetchZones = async (): Promise<Zone[]> => {
  try {
    console.log("Fetch Zone");
    const response = await axios.get(`${API_BASE_URL}/activity-zones`, {
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
    // Send a PATCH request for partial updates (more RESTful)
    const response = await axios.patch(
      `${API_BASE_URL}/activity-zones/${id}`,
      formData,
      {
        withCredentials: true, // Ensure cookies are sent with the request
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

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
    await axios.delete(`${API_BASE_URL}/activity-zones/${id}`, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
  } catch (error) {
    console.error("Error deleting zone:", error);
    throw new Error("Failed to delete zone");
  }
};
