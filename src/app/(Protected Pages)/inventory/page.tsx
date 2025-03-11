"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import InventoryTable from "./components/InventoryTable";
import InventoryForm from "./components/InventoryForm";
import DeleteModal from "./components/DeleteModal";
import { InventoryItem } from "./types/InventoryTypes";
import { useRouter } from "next/navigation";
import { deleteInventory, fetchInventories, updateInventory } from "./api/Inventory";

const InventoryPage = () => {
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Fetch inventory on component mount
  useEffect(() => {
    const loadInventories = async () => {
      try {
        const data = await fetchInventories();
        setInventories(data);
      } catch (err) {
        console.error("Error fetching inventories:", err);
        setError("Failed to fetch inventory.");
      } finally {
        setLoading(false);
      }
    };

    loadInventories();
  }, []);

  const handleSave = async (item: InventoryItem) => {
    console.log("SAVE BUTTON CLICKED:", item);

    try {
      if (item.id) {
        const cleanedSizes = item.sizes.map(({ size, quantity, id }) =>
          id ? { id, size, quantity } : { size, quantity }
        );

        const requestBody = {
          equipment_name: item.equipment_name,
          totalQuantity: item.totalQuantity,
          availableQuantity: item.availableQuantity,
          rental_price_per_hour: item.rental_price_per_hour,
          sizes: cleanedSizes,
        };

        const updatedItem = await updateInventory(item.id, requestBody);
        if (updatedItem.id) {
          setInventories((prev) =>
            prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
          );
        }
      }

      setSelectedItem(null);
    } catch (error) {
      console.error("Error saving inventory:", error);
      alert("Failed to save inventory. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      await deleteInventory(selectedItem.id);
      setInventories((prev) => prev.filter((i) => i.id !== selectedItem.id));
      setSelectedItem(null);
      setIsDeleting(false);
    } catch (error) {
      console.error("Error deleting inventory:", error);
      alert("Failed to delete inventory. Please try again.");
    }
  };

  const handleAddInventoryClick = () => {
    router.push("/inventory/add");
  };

  if (loading) return <p>Loading inventory...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Inventory Management</h1>

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
