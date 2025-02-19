"use client";

import { useState } from "react";
import { useUser } from "../../../context/UserContext"; // Import useUser hook

export default function AddInventoryPage() {
  const { user } = useUser(); // Get user from context

  const [formData, setFormData] = useState({
    equipment_name: "",
    totalQuantity: 1, // Initialize with a valid integer
    availableQuantity: 1, // Initialize with a valid integer
    rental_price_per_hour:  1,
    sizes: [{ size: "", quantity: 1 }], // Initialize size quantity as a valid integer
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

// Handle input changes for main fields
const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log("HANDLE CHANGE :", name, value);
  
    // Parse the value as a number (if the value is empty, default to 1)
    const parsedValue = name === "totalQuantity" || name === "availableQuantity"  || name === "rental_price_per_hour"
      ? parseInt(value, 10) || ''  // If the value is empty or NaN, set to 1
      : value;
  
    // Allow any value to be entered and update the state with parsed values
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  
    console.log("FORM DATA HANDLE CHANGE :", formData);  // This will log the updated state
  };
  

// Handle size changes
const handleSizeChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
  
    // Parse the value for quantity and ensure it's a valid number
    let updatedValue = name === "quantity" ? parseInt(value, 10) || '' : value;
  
    // Update the specific size object
    const updatedSizes = [...formData.sizes];
    updatedSizes[index] = {
      ...updatedSizes[index],
      [name]: updatedValue, // Update the size or quantity based on the name
    };
  
    // Update form data
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

  // Validate and handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate that all quantities are integers and greater than or equal to 1
    // const isValid = formData.sizes.every(
    //   (size) => size.quantity >= 1 && Number.isInteger(size.quantity)
    // );
    // if (!isValid) {
    //   setMessage({
    //     type: "error",
    //     text: "All quantities must be valid integers and greater than or equal to 1.",
    //   });
    //   setLoading(false);
    //   return;
    // }

    // Add user ID as customer_id automatically
    const dataToSend = {
      ...formData,
      customer_id: user?.customer_id, // Use as customer_id
    };

    console.log("DATA to Send ", dataToSend);

    try {
      const response = await fetch("http://localhost:3000/inventory/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      setMessage({ type: "success", text: "Inventory added successfully!" });
      setFormData({
        equipment_name: "",
        totalQuantity: 1,
        availableQuantity: 1,
        rental_price_per_hour: 0,
        sizes: [{ size: "", quantity: 1 }],
      });
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
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Add New Inventory
      </h2>

      {message && (
        <div
          className={`p-3 mb-4 rounded-md ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

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

        {/* Price Per Hour */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price Per Hour
          </label>
          <input
            type="number"
            name="rental_price_per_hour"
            value={formData.rental_price_per_hour}
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
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Inventory"}
        </button>
      </form>
    </div>
  );
}
