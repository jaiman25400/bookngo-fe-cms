"use client";

import { useState, useEffect, useCallback } from "react";
import ZoneTable from "./components/ZoneTable";
import ZoneForm from "./components/ZoneForm";
import DeleteModal from "./components/DeleteModal";
import Notification from "@/components/Notification";
import { Zone, UpdateZoneFormData } from "./types/ZoneTypes";
import { useRouter } from "next/navigation";
import { deleteZone, fetchZones, updateZone } from "./api/zone";

const ZonePage = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<UpdateZoneFormData | null>(
    null
  );
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

  useEffect(() => {
    const getZones = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchZones();
        setZones(data || []);
      } catch (err: any) {
        const errorMessage = err.message || "Failed to fetch zones";
        setError(errorMessage);
        showNotification(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    getZones();
  }, [showNotification]);
  
  const handleSave = async (
    zoneData: UpdateZoneFormData,
    thumbnailFile?: File,
    galleryFiles?: File[]
  ) => {
    if (!zoneData.id) {
      const errorMsg = "Missing Zone ID. Cannot update zone.";
      setError(errorMsg);
      showNotification(errorMsg, 'error');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const formData = new FormData();

      if (thumbnailFile) {
        formData.append("zone_thumbnail_image", thumbnailFile);
      }

      if (galleryFiles?.length) {
        galleryFiles.forEach((file) => {
          formData.append("zone_image_gallery", file);
        });
      }

      // Append other zoneData fields safely
      Object.entries(zoneData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'id') {
          formData.append(key, value.toString());
        }
      });

      const updatedZone = await updateZone(zoneData.id, formData);

      if (updatedZone?.id) {
        setZones((prev) =>
          prev.map((i) => (i.id === updatedZone.id ? updatedZone : i))
        );
        setSelectedZone(null);
        showNotification("Zone updated successfully!", 'success');
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedZone) return;

    setIsDeletingLoading(true);
    setError(null);

    try {
      await deleteZone(selectedZone.id);
      setZones((prev) => prev.filter((z) => z.id !== selectedZone.id));
      setSelectedZone(null);
      setIsDeleting(false);
      showNotification("Zone deleted successfully!", 'success');
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete zone. Please try again.";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      setIsDeleting(false);
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const handleAddZoneClick = () => {
    router.push("/zone/add");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Zone Management</h1>
              <p className="text-gray-600 text-sm">
                Manage activity zones and locations
              </p>
            </div>
            <button
              onClick={handleAddZoneClick}
              disabled={loading || isSaving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Zone
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
              <p className="text-gray-600 font-medium">Loading zones...</p>
            </div>
          </div>
        ) : selectedZone ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <ZoneForm
              initialData={selectedZone}
              onSave={handleSave}
              onCancel={() => {
                setSelectedZone(null);
                setError(null);
              }}
              isSaving={isSaving}
            />
          </div>
        ) : zones.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No zones found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first zone.</p>
            <button
              onClick={handleAddZoneClick}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 font-medium inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Zone
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <ZoneTable
              zones={zones}
              onEdit={setSelectedZone}
              onDelete={(id: number) => {
                setSelectedZone(zones.find((z) => z.id === id) || null);
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
            setSelectedZone(null);
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

export default ZonePage;
