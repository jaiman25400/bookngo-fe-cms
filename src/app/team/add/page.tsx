"use client";

import { useState, ChangeEvent } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUser } from "../../../context/UserContext";

const AddTeam = () => {
  const router = useRouter();
  const { user } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Team", // Default role
    customerId : user?.id
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      console.log("Api Sent Data :",formData)
      const response = await axios.post("http://localhost:3000/customer-users/invite", formData);
      if (response.status === 201) {
        alert("Team member added successfully!");
        router.push("/team");
      }
    } catch (err:any) {
      setError(err.response?.data?.message || "Failed to add team member");
    } finally { 
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 mt-10">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white text-center">
        Add New Team Member
      </h2>
      {error && <p className="text-red-500 text-center mt-2">{error}</p>}
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
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          disabled={!formData.name || !formData.email || loading}
        >
          {loading ? "Adding..." : "Add Member"}
        </button>
      </form>
    </div>
  );
};

export default AddTeam;