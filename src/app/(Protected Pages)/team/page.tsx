"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getTeamMembers } from "./api/team";

const TeamPage = () => {
  // Define CustomerUser type
  type CustomerUser = {
    id: number;
    email: string;
    name: string;
    role: string;
    is_active: boolean;
    created_at: string;
  };
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [teamMembers, setTeamMembers] = useState<CustomerUser[]>([]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const data = await getTeamMembers();
        setTeamMembers(data);
      } catch (err) {
        setError("Failed to fetch inventory.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  if (loading) return <p>Loading inventory...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen p-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            Our Team
          </h2>
          <Link
            href="/team/add"
            className="mt-4 sm:mt-0 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add New Member
          </Link>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search team members..."
            className="w-full sm:w-1/2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Display Team Members */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers
            .filter((member) =>
              member.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((member) => (
              <div
                key={member.id}
                className="p-5 bg-gray-50 rounded-lg shadow dark:bg-gray-800"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {member.name}
                </h3>
                <span className="text-gray-500 dark:text-gray-400">
                  {member.role}
                </span>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  {member.email}
                </p>
                <button className="mt-3 text-blue-600 hover:underline">
                  View Profile
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
