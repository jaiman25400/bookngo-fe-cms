"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createActivity } from "../api/activity";
import { useUser } from "../../../context/UserContext"; // Import useUser hook

export default function AddActivityPage() {
  const { user } = useUser();

  const [formData, setFormData] = useState({
    activity_name: "",
    base_price: "",
    duration_hours: "",
    start_time: "",
    end_time: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "is_active" ? value === "true" : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
  
    try {
      // Prepare payload without sending null values
      const payload: any = {
        activity_name: formData.activity_name,
        base_price: parseFloat(formData.base_price),
        duration_hours: parseInt(formData.duration_hours, 10),
        is_active: formData.is_active,
      };
  
      // Only include optional fields if they are not empty
      if (formData.start_time) payload.start_time = `${formData.start_time}:00`;
      if (formData.end_time) payload.end_time = `${formData.end_time}:00`;
      if (formData.start_date) payload.start_date = formData.start_date;
      if (formData.end_date) payload.end_date = formData.end_date;
  
      await createActivity(payload, user.customer_id);
      setSuccessMessage("Activity added successfully!");
      setTimeout(() => router.push("/activity"), 1500);
    } catch (err) {
      setError("Failed to add activity. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Add New Activity
      </h2>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-3 mb-4 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 mb-4 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Activity Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Activity Name
          </label>
          <input
            type="text"
            name="activity_name"
            value={formData.activity_name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Base Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Base Price ($)
          </label>
          <input
            type="number"
            name="base_price"
            value={formData.base_price}
            onChange={handleChange}
            required
            step="0.01"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Duration (Hours)
          </label>
          <input
            type="number"
            name="duration_hours"
            value={formData.duration_hours}
            onChange={handleChange}
            required
            min="1"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Start Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            type="time"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* End Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Time
          </label>
          <input
            type="time"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            name="is_active"
            value={formData.is_active.toString()}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Activity"}
        </button>
      </form>
    </div>
  );
}
