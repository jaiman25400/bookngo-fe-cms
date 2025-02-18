"use client";

import React, { useEffect, useState } from "react";
import { InventoryItem } from "../types/InventoryTypes";

interface InventoryFormProps {
  initialData?: InventoryItem | null; // Data for editing
  onSave: (item: InventoryItem) => void; // Save callback function
  onCancel: () => void; // Cancel function
}

const InventoryForm: React.FC<InventoryFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {

  console.log("Inventory Update",initialData)
  // Initialize form state with either initialData (for edit) or empty fields (for add)
  const [formData, setFormData] = useState<InventoryItem>({
    id: initialData?.id || 0,
    equipment_name: initialData?.equipment_name || "",
    totalQuantity: initialData?.totalQuantity || 1,
    availableQuantity: initialData?.availableQuantity || 1,
    sizes:
      typeof initialData?.sizes === "string"
        ? []
        : initialData?.sizes || [{ size: "", quantity: 1 }],
  });

  // Handle input changes for main fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Parse values for numbers
    const parsedValue =
      name === "totalQuantity" || name === "availableQuantity"
        ? parseInt(value, 10) || ''
        : value;

    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  // Handle size changes
  const handleSizeChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    // Ensure quantity is a valid integer
    const parsedValue = name === "quantity" ? parseInt(value, 10) || '' : value;

    const updatedSizes = [...formData.sizes];
    updatedSizes[index] = { ...updatedSizes[index], [name]: parsedValue };

    setFormData((prev) => ({ ...prev, sizes: updatedSizes }));
  };

  // Add new size input
  const addSizeField = () => {
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: "", quantity: 1 }],
    }));
  };

  // Remove a size field
  const removeSizeField = (index: number) => {
    const updatedSizes = [...formData.sizes];
    updatedSizes.splice(index, 1);
    setFormData((prev) => ({ ...prev, sizes: updatedSizes }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {initialData ? "Edit Inventory" : "Add New Inventory"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Equipment Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Equipment Name
          </label>
          <input
            type="text"
            name="equipment_name"
            value={formData.equipment_name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Total Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Total Quantity
          </label>
          <input
            type="number"
            name="totalQuantity"
            value={formData.totalQuantity}
            onChange={handleChange}
            required
            min="1"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Available Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Available Quantity
          </label>
          <input
            type="number"
            name="availableQuantity"
            value={formData.availableQuantity}
            onChange={handleChange}
            required
            min="1"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Sizes Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sizes (Optional)
          </label>
          {formData.sizes.map((size, index) => (
            <div key={index} className="flex items-center space-x-2 mt-2">
              <input
                type="text"
                name="size"
                placeholder="Size (e.g., Small, Medium)"
                value={size.size}
                onChange={(e) => handleSizeChange(index, e)}
                className="p-2 border border-gray-300 rounded-md flex-1"
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={size.quantity}
                onChange={(e) => handleSizeChange(index, e)}
                min="1"
                className="p-2 border border-gray-300 rounded-md w-20"
              />
              {formData.sizes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSizeField(index)}
                  className="p-2 text-red-500"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addSizeField}
            className="mt-2 text-blue-600 hover:underline"
          >
            + Add Size
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300"
          >
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white">
            {initialData ? "Update Inventory" : "Add Inventory"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;
