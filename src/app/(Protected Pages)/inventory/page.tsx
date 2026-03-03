"use client";

import { useState, useEffect, useCallback } from "react";
import InventoryTable from "./components/InventoryTable";
import InventoryForm from "./components/InventoryForm";
import DeleteModal from "./components/DeleteModal";
import Notification from "@/components/Notification";
import { InventoryItem } from "./types/InventoryTypes";
import { useRouter } from "next/navigation";
import {
  deleteInventory,
  fetchInventories,
  updateInventory,
} from "./api/Inventory";

const InventoryPage = () => {
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
  }>({ message: '', type: 'info', visible: false });

  const router = useRouter();

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({ message, type, visible: true });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, visible: false }));
  }, []);

  // Fetch inventory on component mount
  useEffect(() => {
    const loadInventories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchInventories();
        setInventories(data || []);
      } catch (err: any) {
        const errorMessage = err.message || "Failed to fetch inventory.";
        setError(errorMessage);
        showNotification(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    loadInventories();
  }, [showNotification]);

  const handleSave = async (item: InventoryItem, thumbnailFile?: File) => {
    if (!item.id) {
      const errorMsg = "Missing Inventory ID. Cannot update inventory.";
      setError(errorMsg);
      showNotification(errorMsg, 'error');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const formData = new FormData();

      // Append the file if it exists
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
      }

      // Convert sizes array to JSON string
      const cleanedSizes = item.sizes.map(
        ({ size, description, quantity }) => ({
          size,
          description,
          quantity,
        })
      );

      // Append other fields
      formData.append("equipment_name", item.equipment_name);
      formData.append("totalQuantity", item.totalQuantity.toString());
      formData.append("availableQuantity", item.availableQuantity.toString());
      formData.append(
        "rental_price_per_hour",
        item.rental_price_per_hour.toString()
      );
      formData.append("description", item.description);
      formData.append("sizes", JSON.stringify(cleanedSizes));

      const updatedItem = await updateInventory(item.id, formData);
      if (updatedItem.id) {
        setInventories((prev) =>
          prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
        );
      }
      setSelectedItem(null);
      showNotification("Inventory updated successfully!", 'success');
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save inventory. Please try again.";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    
    setIsDeletingLoading(true);
    setError(null);

    try {
      await deleteInventory(selectedItem.id);
      setInventories((prev) => prev.filter((i) => i.id !== selectedItem.id));
      setSelectedItem(null);
      setIsDeleting(false);
      showNotification("Inventory deleted successfully!", 'success');
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete inventory. Please try again.";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      setIsDeleting(false);
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const handleAddInventoryClick = () => {
    router.push("/inventory/add");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
              <p className="text-gray-600 text-sm">
                Manage your equipment and inventory items
              </p>
            </div>
            <button
              onClick={handleAddInventoryClick}
              disabled={loading || isSaving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Inventory
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && !notification.visible && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg mb-6 animate-fade-in">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600 font-medium">Loading inventory...</p>
            </div>
          </div>
        ) : selectedItem ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <InventoryForm
              initialData={selectedItem}
              onSave={handleSave}
              onCancel={() => {
                setSelectedItem(null);
                setError(null);
              }}
              isSaving={isSaving}
            />
          </div>
        ) : inventories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first inventory item.</p>
            <button
              onClick={handleAddInventoryClick}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 font-medium inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Item
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <InventoryTable
              inventories={inventories}
              onEdit={setSelectedItem}
              onDelete={(id) => {
                setSelectedItem(inventories.find((i) => i.id === id) || null);
                setIsDeleting(true);
              }}
            />
          </div>
        )}

        <DeleteModal
          isOpen={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => {
            setIsDeleting(false);
            setSelectedItem(null);
          }}
          isLoading={isDeletingLoading}
        />

        {/* Notification Toast */}
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.visible}
          onClose={hideNotification}
        />
      </div>
    </div>
  );
};

export default InventoryPage;
