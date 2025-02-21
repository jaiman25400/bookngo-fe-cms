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
import { useUser } from "../../context/UserContext";

interface Activity {
  id: number;
  activity_name: string;
  base_price: number;
  duration_hours: number;
  is_active: boolean;
}

export default function ActivityPage() {
  const { user } = useUser();
  const router = useRouter();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllActivities = async () => {
      if (!user?.customer_id) return;
      try {
        setLoading(true);
        const data = await fetchActivities(user.customer_id);
        setActivities(data);
      } catch (err) {
        setError("Failed to load activities.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllActivities();
  }, [user?.customer_id]);

  const handleSave = async (updatedActivity: Activity) => {
    try {
      if (updatedActivity.id) {
        const result = await updateActivity(
          updatedActivity.id,
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
    if (!selectedActivity) return;
    try {
      await deleteActivity(selectedActivity.id);
      setActivities((prev) =>
        prev.filter((activity) => activity.id !== selectedActivity.id)
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

      {/* Add Activity Button */}
      {!selectedActivity && (
        <button
          onClick={handleAddActivityClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md"
        >
          + Add Activity
        </button>
      )}

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
            setSelectedActivity(
              activities.find((act) => act.id === id) || null
            );
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
