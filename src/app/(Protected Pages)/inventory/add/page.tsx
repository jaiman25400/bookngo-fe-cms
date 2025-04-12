"use client";

import { useState } from "react";
import { addInventory } from "../api/Inventory";

export default function AddInventoryPage() {
  const [formData, setFormData] = useState({
    equipment_name: "",
    totalQuantity: 0, // Changed from null to 0
    availableQuantity: 0, // Changed from null to 0
    rental_price_per_hour: 0, // Changed from null to 0
    description: "", // New optional field for inventory description
    sizes: [{ size: "", quantity: 0, description: "" }], // Added description field for each size
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Handle input changes for main fields
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    console.log("HANDLE CHANGE :", name, value);

    // Parse the value as a number for numeric fields
    const parsedValue =
      name === "totalQuantity" ||
      name === "availableQuantity" ||
      name === "rental_price_per_hour"
        ? parseInt(value, 10) || 0
        : value;

    setFormData((prev) => ({ ...prev, [name]: parsedValue }));

    console.log("FORM DATA HANDLE CHANGE :", formData);
  };

  // Handle file input change for thumbnail image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
    }
  };

  // Handle size changes
  const handleSizeChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const updatedSizes = [...formData.sizes];

    // For numeric fields, parse the value
    const parsedValue = name === "quantity" ? parseInt(value, 10) || 0 : value;

    updatedSizes[index] = {
      ...updatedSizes[index],
      [name]: parsedValue,
    };

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
    const updatedSizes = [...formData.sizes];
    updatedSizes.splice(index, 1);
    setFormData((prev) => ({ ...prev, sizes: updatedSizes }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const formDataToSend = new FormData();

      // Append text fields
      formDataToSend.append("equipment_name", formData.equipment_name);
      formDataToSend.append("totalQuantity", formData.totalQuantity.toString());
      formDataToSend.append(
        "availableQuantity",
        formData.availableQuantity.toString()
      );
      formDataToSend.append(
        "rental_price_per_hour",
        formData.rental_price_per_hour.toString()
      );
      formDataToSend.append("description", formData.description);

      // Append sizes as JSON string
      formDataToSend.append("sizes", JSON.stringify(formData.sizes));

      // Append thumbnail file if exists
      if (thumbnailFile) {
        formDataToSend.append("thumbnail", thumbnailFile);
      }
      console.log("Submit INV");
      for (const [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }
      const newInventory = await addInventory(formDataToSend);
      setMessage({ type: "success", text: "Inventory added successfully!" });

      setFormData({
        equipment_name: "",
        totalQuantity: 0,
        availableQuantity: 0,
        rental_price_per_hour: 0,
        description: "",
        sizes: [{ size: "", quantity: 0, description: "" }],
      });

      setThumbnailFile(null);
      setThumbnailPreview(null);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Error adding inventory",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-xl rounded-xl mt-8 dark:bg-gray-800">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
        Add New Inventory
      </h2>

      {message && (
        <div
          className={`p-4 mb-6 rounded-lg ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Equipment Name */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Equipment Name
          </label>
          <input
            type="text"
            name="equipment_name"
            value={formData.equipment_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Grid for Quantity Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Quantity
            </label>
            <input
              type="number"
              name="totalQuantity"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Available Quantity
            </label>
            <input
              type="number"
              name="availableQuantity"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* Price Per Hour */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Price Per Hour
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              name="rental_price_per_hour"
              onChange={handleChange}
              required
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* Inventory Description */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Inventory Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter inventory description..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Thumbnail Image */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Thumbnail Image (Optional)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              name="thumbnailImageUrl"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept="image/*"
            />
            {thumbnailPreview && (
              <img
                src={thumbnailPreview}
                alt="Thumbnail Preview"
                className="h-16 w-16 object-cover rounded-lg border"
              />
            )}
          </div>
        </div>

        {/* Sizes Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Sizes (Optional)
          </label>
          <div className="space-y-3">
            {formData.sizes.map((size, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm text-gray-600 dark:text-gray-400">
                      Size
                    </label>
                    <input
                      type="text"
                      name="size"
                      placeholder="Small/Medium/Large"
                      value={size.size}
                      onChange={(e) => handleSizeChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm text-gray-600 dark:text-gray-400">
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      placeholder="0"
                      onChange={(e) => handleSizeChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm text-gray-600 dark:text-gray-400">
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      placeholder="Optional"
                      value={size.description}
                      onChange={(e) => handleSizeChange(index, e)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    />
                  </div>
                </div>

                {formData.sizes.length > 1 && (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeSizeField(index)}
                      className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addSizeField}
            className="w-full py-2 text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Size
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Adding...
            </>
          ) : (
            "Add Inventory"
          )}
        </button>
      </form>
    </div>
  );
}
