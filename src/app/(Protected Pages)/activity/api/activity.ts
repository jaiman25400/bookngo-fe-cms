import axios from "axios";

const API_BASE_URL = process.env.SERVER_API_BASE_URL || "http://localhost:3000";

// Fetch all activities
export const fetchActivities = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/activities`, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw new Error("Failed to fetch activities");
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
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error creating activity:", error);
    // Throw error with proper message formatting
    const errorMessage =
      error.response?.data?.message || "Failed to create activity";
    throw new Error(errorMessage);
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
    console.log("Act for update ", activityData);
    const response = await axios.patch(
      `${API_BASE_URL}/activities/${id}`,
      activityData,
      {
        withCredentials: true, // Ensure cookies are sent with the request
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating activity:", error);
    throw new Error("Failed to update activity");
  }
};

// Delete activity
export const deleteActivity = async (id: number) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/activities/${id}`, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw new Error("Failed to delete activity");
  }
};
