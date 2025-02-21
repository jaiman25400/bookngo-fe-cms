"use client";

import React, { useState } from "react";

interface Activity {
  id: number;
  activity_name: string;
  base_price: number;
  duration_hours: number;
  is_active: boolean;
}

interface ActivityFormProps {
  initialData?: Activity | null;
  onSave: (activity: Activity) => void;
  onCancel: () => void;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Activity>({
    id: initialData?.id || 0,
    activity_name: initialData?.activity_name || "",
    base_price: initialData?.base_price || 0,
    duration_hours: initialData?.duration_hours || 1,
    is_active: initialData?.is_active || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "is_active" ? value === "true" : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {initialData ? "Edit Activity" : "Add New Activity"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Activity Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Activity Name</label>
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
          <label className="block text-sm font-medium text-gray-700">Base Price ($)</label>
          <input
            type="number"
            name="base_price"
            value={formData.base_price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (Hours)</label>
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

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
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

        {/* Submit Buttons */}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded-md">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">
            {initialData ? "Update Activity" : "Add Activity"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActivityForm;
