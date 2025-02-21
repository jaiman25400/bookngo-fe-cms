import axios from "axios";

// API Base URL (Update as needed)
const API_URL = "http://localhost:3000/activities";

// Fetch all activities
export const fetchActivities = async (customerId: number) => {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          'Customer-ID': customerId.toString(), // Send customerId in headers
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching activities:", error);
      throw new Error("Failed to fetch activities");
    }
  };
  
// Create new activity
export const createActivity = async (activityData: any, customerId: number) => {
  try {
    const payload = {
      ...activityData,
      customer_id: customerId, // Pass customer_id from the frontend context
    };
    console.log("Create Activity Data with Customer ID:", payload);

    const response = await axios.post(`${API_URL}/add`, payload);
    return response.data;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw new Error("Failed to create activity");
  }
};

// Fetch single activity by ID
export const fetchActivityById = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching activity:", error);
    throw new Error("Failed to fetch activity details");
  }
};

// Update existing activity
export const updateActivity = async (id: number, activityData: any) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, activityData);
    return response.data;
  } catch (error) {
    console.error("Error updating activity:", error);
    throw new Error("Failed to update activity");
  }
};

// Delete activity
export const deleteActivity = async (id: number) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw new Error("Failed to delete activity");
  }
};
