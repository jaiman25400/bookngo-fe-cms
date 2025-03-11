"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ActivityTable from "./components/ActivityTable";
import ActivityForm from "./components/ActivityForm";
import DeleteModal from "./components/DeleteActivity";
import {
  fetchActivities,
  deleteActivity,
  updateActivity,
} from "./api/activity";

export default function ActivityPage() {
  const router = useRouter();

  const [activities, setActivities] = useState<any[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [selectDelteActivityID, setSelectDeleteActivityID] = useState<
    number | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllActivities = async () => {
      try {
        setLoading(true);
        const data = await fetchActivities();
        console.log("Fetch Activity :", data);
        setActivities(data);
      } catch (err) {
        setError("Failed to load activities.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllActivities();
  }, []);

  const handleSave = async (updatedActivity: any) => {
    try {
      if (updatedActivity.id) {
        const result = await updateActivity(
          updatedActivity
        );
        setActivities((prev) =>
          prev.map((activity) =>
            activity.id === result.id ? result : activity
          )
        );
      }
      setSelectedActivity(null);
    } catch (error) {
      console.error("Error updating activity:", error);
      alert("Failed to update activity.");
    }
  };

  const handleDelete = async () => {
    if (!selectDelteActivityID) return;
    try {
      console.log("Del Button :", selectDelteActivityID);
      await deleteActivity(selectDelteActivityID);

      // Filter using the delete activity ID directly
      setActivities((prev) =>
        prev.filter((activity) => activity.id !== selectDelteActivityID)
      );
      setSelectedActivity(null);
      setIsDeleting(false);
    } catch (error) {
      console.error("Error deleting activity:", error);
      alert("Failed to delete activity.");
    }
  };

  // Navigate to the Add Activity page
  const handleAddActivityClick = () => {
    router.push("/activity/add"); // Redirect to the Add Inventory page
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Activities</h1>

      {/* Button Container - Flex for responsiveness */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={handleAddActivityClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          + Add Activity
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500 text-center py-6">
          Loading activities...
        </div>
      ) : selectedActivity ? (
        <ActivityForm
          initialData={selectedActivity}
          onSave={handleSave}
          onCancel={() => setSelectedActivity(null)}
        />
      ) : (
        <ActivityTable
          activities={activities}
          onEdit={setSelectedActivity}
          onDelete={(id) => {
            setSelectDeleteActivityID(id);
            setIsDeleting(true);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleting(false)}
      />
    </div>
  );
}
