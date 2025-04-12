"use client";

import React from "react";
import { InventoryItem } from "../types/InventoryTypes";

interface InventoryTableProps {
  inventories: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: number) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  inventories,
  onEdit,
  onDelete,
}) => {

  console.log("Inventory Table Props :", inventories);
  return (
    <div className="p-4 bg-white shadow-lg rounded-lg overflow-x-auto">
      <table className="w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="p-3 text-left border border-gray-300">Name</th>
            <th className="p-3 text-left border border-gray-300">Total Qty</th>
            <th className="p-3 text-left border border-gray-300">Available Qty</th>
            <th className="p-3 text-left border border-gray-300">Total Sizes</th>
            <th className="p-3 text-left border border-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventories.length > 0 ? (
            inventories.map((item) => (
              <tr key={item.id} className="border border-gray-300 hover:bg-gray-100">
                <td className="p-3 border border-gray-300">{item.equipment_name}</td>
                <td className="p-3 border border-gray-300">{item.totalQuantity}</td>
                <td className="p-3 border border-gray-300">{item.availableQuantity}</td>
                <td className="p-3 border border-gray-300">{item.sizes ? item.sizes.length : 0}</td>
                <td className="p-3 border border-gray-300 flex space-x-3">
                  <button
                    onClick={() => onEdit(item)}
                    className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
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
                No inventories found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
