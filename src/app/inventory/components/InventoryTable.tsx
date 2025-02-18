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

  console.log("Inventory Table Props :",inventories)
  return (
    <div className="p-4 bg-white shadow rounded-lg overflow-x-auto">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-3 text-left border-b">Name</th>
            <th className="p-3 text-left border-b">Total Qty</th>
            <th className="p-3 text-left border-b">Available Qty</th>
            <th className="p-3 text-left border-b">Total Sizes</th>
            <th className="p-3 text-left border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventories.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-3">{item.equipment_name}</td>
              <td className="p-3">{item.totalQuantity}</td>
              <td className="p-3">{item.availableQuantity}</td>
              <td className="p-3">{item.sizes ? item.sizes.length : 0}</td>
              <td className="p-3">
                <button
                  onClick={() => onEdit(item)}
                  className="text-blue-500 hover:underline px-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-500 hover:underline px-2"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))} 
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
