"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter to navigate programmatically
import { CreateZone } from "../types/ZoneTypes";
import { addZone } from "../api/zone";

export default function AddZonePage() {
  const [formData, setFormData] = useState<CreateZone>({
    name: "",
    description: "",
    capacity: null,
    price: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Use Next.js useRouter for page redirection
  const router = useRouter();

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value === "" && type === "number" ? null : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Attempt to add the zone
      await addZone(formData);
      setSuccessMessage("Zone added successfully!");

      // Redirect back to /zone page after successful submission
      setTimeout(() => {
        router.push("/zone");
      }, 1500); // Adding delay before redirection for user feedback
    } catch (error) {
      console.error("Error adding zone:", error);
      setError("Failed to add activity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Zone</h2>

      {/* Display success message */}
      {successMessage && (
        <div className="text-green-600 mb-4">
          <strong>{successMessage}</strong>
        </div>
      )}

      {/* Display error message */}
      {error && (
        <div className="text-red-600 mb-4">
          <strong>{error}</strong>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Zone Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Zone Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Capacity Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Capacity
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity || ""}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Price Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            type="text"
            name="price"
            value={formData.price || ""}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            className={`px-4 py-2 bg-blue-500 text-white ${
              loading && "opacity-50 cursor-not-allowed"
            }`}
            disabled={loading} // Disable button while loading
          >
            {loading ? "Adding Zone..." : "Add Zone"}
          </button>
        </div>
      </form>
    </div>
  );
}
