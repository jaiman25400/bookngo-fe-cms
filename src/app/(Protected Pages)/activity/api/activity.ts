import axios from "axios";
import { CreateActivityPayload } from "../types/activityTypes";
// API Base URL (Update as needed)
const API_URL = "http://localhost:3000";

// Fetch all activities
export const fetchActivities = async () => {
  try {
    const response = await axios.get(`${API_URL}/activities`, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw new Error("Failed to fetch activities");
  }
};

// Create new activity
export const createActivity = async (
  activityData: CreateActivityPayload
): Promise<CreateActivityPayload> => {
  try {
    console.log("Create Activity Data with Customer ID:", activityData);

    const response = await axios.post(
      `${API_URL}/activities/add`,
      activityData,
      {
        withCredentials: true, // Ensure cookies are sent with the request
      }
    );
    console.log("Res :", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw new Error("Failed to create activity");
  }
};

// Fetch single activity by ID
export const fetchActivityById = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL}/activities/${id}`, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching activity:", error);
    throw new Error("Failed to fetch activity details");
  }
};

// Update existing activity
export const updateActivity = async (activityData: any) => {
  try {
    const { id, ...activityWithoutId } = activityData;
    console.log("Act for update ", activityWithoutId);
    const response = await axios.patch(
      `${API_URL}/activities/${id}`,
      activityWithoutId,
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
    const response = await axios.delete(`${API_URL}/activities/${id}`, {
      withCredentials: true, // Ensure cookies are sent with the request
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw new Error("Failed to delete activity");
  }
};
