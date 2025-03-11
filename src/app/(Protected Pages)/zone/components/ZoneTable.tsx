"use client";

import React from "react";
import { Zone } from "../types/ZoneTypes";

interface ZoneTableProps {
  zones: Zone[]; // Ensure zones is an array
  onEdit: (zone: Zone) => void;
  onDelete: (id: number) => void;
}

const ZoneTable: React.FC<ZoneTableProps> = ({ zones, onEdit, onDelete }) => {
  // Check if zones is an empty array

  return (
    <div className="p-4 bg-white shadow rounded-lg overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-3 text-left border-b">Zone Name</th>
            <th className="p-3 text-left border-b">Capacity</th>
            <th className="p-3 text-left border-b">Price</th>
            <th className="p-3 text-left border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {zones.length > 0 ? (
            zones.map((zone) => (
              <tr key={zone.id} className="border-b">
                <td className="p-3">{zone.name}</td>
                <td className="p-3">{zone.capacity}</td>
                <td className="p-3">{zone.price}</td>
                <td className="p-3">
                  <button
                    onClick={() => onEdit(zone)}
                    className="text-blue-500 hover:underline px-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(zone.id)}
                    className="text-red-500 hover:underline px-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={5}
                className="text-center text-gray-500 py-6 border border-gray-300"
              >
                No Zone found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ZoneTable;
