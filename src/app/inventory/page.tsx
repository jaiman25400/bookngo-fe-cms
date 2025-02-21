"use client";

import { useState, useEffect } from "react";
import InventoryTable from "./components/InventoryTable";
import InventoryForm from "./components/InventoryForm";
import DeleteModal from "./components/DeleteModal";
import { InventoryItem } from "./types/InventoryTypes";
import { useRouter } from "next/navigation";
import {
  deleteInventory,
  fetchInventories,
  updateInventory,
} from "./api/Inventory"; // Import fetchInventories API function
import { useUser } from "../../context/UserContext"; // Import useUser hook

const InventoryPage = () => {
  const { user } = useUser();

  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state to show a spinner or message while data is being fetched
  const [error, setError] = useState<string | null>(null); // Error state to show an error message if something goes wrong

  const router = useRouter(); // Initialize the router

  // Fetch inventories when the component mounts
  useEffect(() => {
    const getInventories = async () => {
      if (!user?.customer_id) return; // Prevent API call if customer_id is not available

      try {
        const data = await fetchInventories(user.customer_id);
        console.log("Data in Inventory :",data)
        setInventories(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch inventory");
        setLoading(false);
      }
    };

    getInventories();
  }, [user?.customer_id]); // 🔄 Runs again if `customer_id` changes

  const handleSave = async (item: InventoryItem) => {
    console.log("SAVE BUTTON CLICKED:", item);

    try {
      if (item.id) {
        // Clean the sizes before sending to the API
        const cleanedSizes = item.sizes.map(({ size, quantity, id }) => {
          return id ? { id, size, quantity } : { size, quantity }; // Keep 'id' for existing sizes, and omit for new ones
        });

        // Prepare the request body without the id in the body
        const requestBody = {
          equipment_name: item.equipment_name,
          totalQuantity: item.totalQuantity,
          availableQuantity: item.availableQuantity,
          rental_price_per_hour: item.rental_price_per_hour,
          sizes: cleanedSizes, // Only send size and quantity, keep 'id' for existing sizes
        };

        console.log("Request Body:", requestBody); // Check the final data structure

        // Call the update API (no need to send id in the body)
        const updatedItem = await updateInventory(item.id, requestBody); // id is passed in the URL

        // Now update the UI with the response (which includes 'id')
        if (updatedItem.id) {
          setInventories((prev) =>
            prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
          );
        }
      }

      setSelectedItem(null); // Reset selection after saving
    } catch (error) {
      console.error("Error saving inventory:", error);
      alert("Failed to save inventory. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!selectedItem || !user?.customer_id) return; // Ensure selectedItem and customer_id exist
  
    try {
      await deleteInventory(selectedItem.id, user.customer_id); // ✅ Pass customer_id
  
      // Update state to remove deleted item
      setInventories((prev) => prev.filter((i) => i.id !== selectedItem.id));
  
      // Reset selected item and close modal
      setSelectedItem(null);
      setIsDeleting(false);
    } catch (error) {
      console.error("Error deleting inventory:", error);
      alert("Failed to delete inventory. Please try again.");
    }
  };
  

  // Navigate to the Add Inventory page
  const handleAddInventoryClick = () => {
    router.push("/inventory/add"); // Redirect to the Add Inventory page
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Inventory Management</h1>

      {/* Add Inventory Button */}
      <button
        onClick={handleAddInventoryClick}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Add New Inventory
      </button>
      {selectedItem ? (
        <InventoryForm
          initialData={selectedItem}
          onSave={handleSave}
          onCancel={() => setSelectedItem(null)}
        />
      ) : (
        <InventoryTable
          inventories={inventories}
          onEdit={setSelectedItem}
          onDelete={(id) => {
            setSelectedItem(inventories.find((i) => i.id === id) || null);
            setIsDeleting(true);
          }}
        />
      )}
      <DeleteModal
        isOpen={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleting(false)}
      />
    </div>
  );
};

export default InventoryPage;
