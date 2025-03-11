import React, { useState } from "react";
import { Zone } from "../types/ZoneTypes";

interface ZoneFormProps {
  initialData?: Zone | null;
  onSave: (zone: Zone) => void;
  onCancel: () => void;
}

const ZoneForm: React.FC<ZoneFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Zone>({
    id: initialData?.id ?? 0, // Default to 0 if id is not present
    name: initialData?.name || "",
    description: initialData?.description || "",
    capacity: initialData?.capacity ?? null, // Default to null if no value
    price: initialData?.price ?? null, // Default to null if no value
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
    };

    onSave(payload);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {initialData ? "Edit Zone" : "Add New Zone"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Capacity
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity || ""}
            onChange={handleChange}
            required
            min="1"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

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

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300"
          >
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white">
            {initialData ? "Update Zone" : "Add Zone"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ZoneForm;
