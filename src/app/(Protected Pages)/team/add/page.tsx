"use client";

import { useState, ChangeEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import { inviteTeamMembers } from "../api/team";
import Notification from "@/components/Notification";

const AddTeam = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Team",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotification({ message: '', type: 'info', visible: false });

    // Validation
    if (!formData.name.trim() || !formData.email.trim()) {
      const errorMsg = "Name and email are required";
      setError(errorMsg);
      showNotification(errorMsg, 'error');
      setLoading(false);
      return;
    }

    try {
      await inviteTeamMembers(formData);
      showNotification("Team member invitation sent successfully! Redirecting...", 'success');
      setTimeout(() => router.push("/team"), 2000);
    } catch (err: any) {
      let errorMessage = "Failed to send invitation. Please try again later.";
      if (err.response?.status === 400) {
        errorMessage = err.response.data.message || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => router.push("/team")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Add New Team Member</h1>
          </div>
          <p className="text-gray-600 text-sm ml-12">
            Invite a new team member by sending them an invitation email
          </p>
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter full name"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Role Dropdown */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Select Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
            <option value="Team">Team Member</option>
          </select>
        </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push("/team")}
              disabled={loading}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name || !formData.email || loading}
              className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
        </div>

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

export default AddTeam;
