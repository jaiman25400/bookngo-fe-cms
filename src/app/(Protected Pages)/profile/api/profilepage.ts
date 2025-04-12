import axios from "axios";
import { ProfileData } from "../types/profileTypes";

const API_BASE_URL = process.env.SERVER_API_BASE_URL || "http://localhost:3000";

export const fetchProfileData = async (): Promise<ProfileData> => {
  // Changed to single object
  try {
    const response = await axios.get(`${API_BASE_URL}/customers/profile`, {
      withCredentials: true,
    });
    console.log('Fetch Profile Data :',response)
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw new Error("Failed to fetch profile");
  }
};

export const createProfileData = async (formData: FormData): Promise<any> => {
  // Changed to single object
  try {
    // Log formData entries
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
    const response = await axios.post(
      `${API_BASE_URL}/customers/profile`,
      formData,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating profile:", error);
    throw new Error("Failed to create profile");
  }
};

export const updateProfileData = async (formData: FormData): Promise<any> => {
  try {
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await axios.put(
      `${API_BASE_URL}/customers/profile`,
      formData,
      {
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw new Error("Failed to update profile");
  }
};

