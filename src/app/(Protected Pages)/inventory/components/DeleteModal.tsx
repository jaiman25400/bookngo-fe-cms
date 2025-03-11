"use client";

import React from "react";

interface DeleteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg">
        <p>Are you sure you want to delete this item?</p>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-300">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
