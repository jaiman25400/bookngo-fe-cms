"use client";

import React, { useEffect, useState } from "react";
import { InventoryItem } from "../types/InventoryTypes";

interface InventoryFormProps {
  initialData?: InventoryItem | null;
  onSave: (item: InventoryItem, thumbnailFile?: File) => void;
  onCancel: () => void;
}

const InventoryForm: React.FC<InventoryFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<InventoryItem>({
    id: initialData?.id || 0,
    equipment_name: initialData?.equipment_name || "",
    totalQuantity: initialData?.totalQuantity || 0,
    availableQuantity: initialData?.availableQuantity || 0,
    rental_price_per_hour: initialData?.rental_price_per_hour || 0,
    description: initialData?.description || "",
    thumbnailImageUrl: initialData?.thumbnailImageUrl || null,
    sizes: Array.isArray(initialData?.sizes)
      ? initialData.sizes
      : [{ size: "", quantity: 0, description: "" }],
  });

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  // Handle input changes for all fields
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const parsedValue = [
      "totalQuantity",
      "availableQuantity",
      "rental_price_per_hour",
    ].includes(name)
      ? parseInt(value, 10) || 0
      : value;

    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  // Handle size changes
  const handleSizeChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const parsedValue = name === "quantity" ? parseInt(value, 10) || 0 : value;

    const updatedSizes = [...formData.sizes];
    updatedSizes[index] = { ...updatedSizes[index], [name]: parsedValue };
    setFormData((prev) => ({ ...prev, sizes: updatedSizes }));
  };

  // Add new size input
  const addSizeField = () => {
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: "", quantity: 0, description: "" }],
    }));
  };

  // Remove a size field
  const removeSizeField = (index: number) => {
    const updatedSizes = formData.sizes.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, sizes: updatedSizes }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updat Inv Form datat save ", formData, thumbnailFile);
    onSave(formData, thumbnailFile || undefined);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
        {initialData ? "Edit Inventory" : "Add New Inventory"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Equipment Name */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Equipment Name *
          </label>
          <input
            type="text"
            name="equipment_name"
            value={formData.equipment_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Quantity and Price Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Total Quantity *
            </label>
            <input
              type="number"
              name="totalQuantity"
              value={formData.totalQuantity}
              onChange={handleChange}
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Available Quantity *
            </label>
            <input
              type="number"
              name="availableQuantity"
              value={formData.availableQuantity}
              onChange={handleChange}
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Price/Hour (₱) *
            </label>
            <input
              type="number"
              name="rental_price_per_hour"
              value={formData.rental_price_per_hour}
              onChange={handleChange}
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Add image upload section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Thumbnail Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {(thumbnailPreview || formData.thumbnailImageUrl) && (
            <img
              src={
                thumbnailPreview ||
                `${process.env.NEXT_PUBLIC_API_BASE_URL}${formData.thumbnailImageUrl}`
              }
              alt="Thumbnail preview"
              className="mt-2 h-32 w-32 object-cover rounded"
            />
          )}
        </div>

        {/* Sizes Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              Sizes (Optional)
            </label>
            <button
              type="button"
              onClick={addSizeField}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Add Size
            </button>
          </div>

          {formData.sizes.map((size, index) => (
            <div key={index} className="space-y-2 border p-4 rounded-lg">
              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <label className="text-sm text-gray-600">Size</label>
                  <input
                    type="text"
                    name="size"
                    placeholder="e.g., Small, Medium"
                    value={size.size}
                    onChange={(e) => handleSizeChange(index, e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="space-y-2 w-24">
                  <label className="text-sm text-gray-600">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={size.quantity}
                    onChange={(e) => handleSizeChange(index, e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {formData.sizes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSizeField(index)}
                    className="text-red-500 hover:text-red-700 self-end pb-2"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-600">
                  Size Description
                </label>
                <textarea
                  name="description"
                  placeholder="Optional size description"
                  value={size.description || ""}
                  onChange={(e) => handleSizeChange(index, e)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            {initialData ? "Update Inventory" : "Create Inventory"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;
