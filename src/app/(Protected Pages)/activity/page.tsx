"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ActivityTable from "./components/ActivityTable";
import ActivityForm from "./components/ActivityForm";
import DeleteModal from "./components/DeleteActivity";
import Notification from "@/components/Notification";
import {
  fetchActivities,
  deleteActivity,
  updateActivity,
} from "./api/activity";

import {
  UpdateActivityFormData,
  currentActivityPayload,
  ScheduleItem,
} from "./types/activityTypes";

export default function ActivityPage() {
  const router = useRouter();

  const [activities, setActivities] = useState<currentActivityPayload[]>([]);
  const [selectedActivity, setSelectedActivity] =
    useState<currentActivityPayload | null>(null);
  const [selectDelteActivityID, setSelectDeleteActivityID] = useState<
    number | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
  }>({ message: '', type: 'info', visible: false });

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({ message, type, visible: true });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    const fetchAllActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchActivities();
        setActivities(data || []);
      } catch (err: any) {
        const errorMessage = err.message || "Failed to load activities.";
        setError(errorMessage);
        showNotification(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAllActivities();
  }, [showNotification]);

  const handleSave = async (
    updatedActivity: UpdateActivityFormData,
    thumbnailFile?: File,
    galleryFiles?: File[],
    schedules?: ScheduleItem[],
    holidays?: string[],
    selectedZones?: number[]
  ) => {
    if (!updatedActivity.id) {
      const errorMsg = "Missing Activity ID. Cannot update activity.";
      setError(errorMsg);
      showNotification(errorMsg, 'error');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const formData = new FormData();

      // Append complex data structures
      if (schedules) {
        formData.append("schedules", JSON.stringify(schedules));
      }
      if (holidays) {
        formData.append(
          "holidays",
          JSON.stringify(holidays.map((date) => ({ date })))
        );
      }
      if (selectedZones) {
        formData.append("zone_id", JSON.stringify(selectedZones));
      }

      if (thumbnailFile) {
        formData.append("activity_thumbnail_image", thumbnailFile);
      }

      if (galleryFiles?.length) {
        galleryFiles.forEach((file) => {
          formData.append("activity_image_gallery", file);
        });
      }

      // Append other ActivityData fields safely
      Object.entries(updatedActivity).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'id') {
          formData.append(key, value.toString());
        }
      });

      const result = await updateActivity(updatedActivity.id, formData);
      setActivities((prev) =>
        prev.map((activity) => (activity.id === result.id ? result : activity))
      );
      setSelectedActivity(null);
      showNotification("Activity updated successfully!", 'success');
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update activity. Please try again.";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectDelteActivityID) return;
    
    setIsDeletingLoading(true);
    setError(null);

    try {
      await deleteActivity(selectDelteActivityID);
      setActivities((prev) =>
        prev.filter((activity) => activity.id !== selectDelteActivityID)
      );
      setSelectedActivity(null);
      setIsDeleting(false);
      setSelectDeleteActivityID(null);
      showNotification("Activity deleted successfully!", 'success');
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete activity. Please try again.";
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      setIsDeleting(false);
    } finally {
      setIsDeletingLoading(false);
    }
  };

  // Navigate to the Add Activity page
  const handleAddActivityClick = () => {
    router.push("/activity/add"); // Redirect to the Add Inventory page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Activities</h1>
              <p className="text-gray-600 text-sm">
                Manage and organize your activities
              </p>
            </div>
            <button
              onClick={handleAddActivityClick}
              disabled={loading || isSaving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Activity
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
              <p className="text-gray-600 font-medium">Loading activities...</p>
            </div>
          </div>
        ) : selectedActivity ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <ActivityForm
              initialData={selectedActivity}
              onSave={handleSave}
              onCancel={() => {
                setSelectedActivity(null);
                setError(null);
              }}
              isSaving={isSaving}
            />
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first activity.</p>
            <button
              onClick={handleAddActivityClick}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 font-medium inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Activity
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <ActivityTable
              activities={activities}
              onEdit={setSelectedActivity}
              onDelete={(id) => {
                setSelectDeleteActivityID(id);
                setIsDeleting(true);
              }}
            />
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteModal
          isOpen={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => {
            setIsDeleting(false);
            setSelectDeleteActivityID(null);
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
}
