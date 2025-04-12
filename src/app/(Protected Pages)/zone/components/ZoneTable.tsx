"use client";

import React from "react";
import { Zone } from "../types/ZoneTypes";

interface ZoneTableProps {
  zones: Zone[];
  onEdit: (zone: Zone) => void;
  onDelete: (id: number) => void;
}

const ZoneTable: React.FC<ZoneTableProps> = ({ zones, onEdit, onDelete }) => {
  console.log('Zone Table Intial Zones :',zones)
  return (
    <div className="p-4 bg-white shadow-lg rounded-lg overflow-x-auto">
      <table className="w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="p-3 text-left border border-gray-300">Zone Name</th>
            <th className="p-3 text-left border border-gray-300">Capacity</th>
            <th className="p-3 text-left border border-gray-300">Price</th>
            <th className="p-3 text-left border border-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {zones.length > 0 ? (
            zones.map((zone) => (
              <tr key={zone.id} className="border border-gray-300 hover:bg-gray-100">
                <td className="p-3 border border-gray-300">{zone.name}</td>
                <td className="p-3 border border-gray-300">{zone.capacity}</td>
                <td className="p-3 border border-gray-300">{zone.price}</td>
                <td className="p-3 border border-gray-300 flex space-x-3">
                  <button
                    onClick={() => onEdit(zone)}
                    className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(zone.id)}
                    className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={4}
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
