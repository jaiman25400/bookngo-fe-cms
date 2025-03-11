"use client";

import React from "react";

interface Activity {
  id: number;
  activity_name: string;
  base_price: number;
  duration_hours: number;
  is_active: boolean;
}

interface ActivityTableProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (id: number) => void;
}

const ActivityTable: React.FC<ActivityTableProps> = ({ activities, onEdit, onDelete }) => {
  return (
    <div className="p-4 bg-white shadow-lg rounded-lg overflow-x-auto">
      <table className="w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="p-3 text-left border border-gray-300">Activity Name</th>
            <th className="p-3 text-left border border-gray-300">Base Price ($)</th>
            <th className="p-3 text-left border border-gray-300">Duration (Hours)</th>
            <th className="p-3 text-left border border-gray-300">Status</th>
            <th className="p-3 text-left border border-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {activities.length > 0 ? (
            activities.map((activity) => (
              <tr key={activity.id} className="border border-gray-300 hover:bg-gray-100">
                <td className="p-3 border border-gray-300">{activity.activity_name}</td>
                <td className="p-3 border border-gray-300">${activity.base_price}</td>
                <td className="p-3 border border-gray-300">{activity.duration_hours} hrs</td>
                <td className="p-3 border border-gray-300">
                  {activity.is_active ? (
                    <span className="text-green-600 font-semibold">Active</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Inactive</span>
                  )}
                </td>
                <td className="p-3 border border-gray-300 flex space-x-3">
                  <button
                    onClick={() => onEdit(activity)}
                    className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(activity.id)}
                    className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center text-gray-500 py-6 border border-gray-300">
                No activities found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityTable;
