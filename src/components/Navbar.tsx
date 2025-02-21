"use client";

import { useState } from "react";
import Link from "next/link"; // Import Link from Next.js
import { useUser } from "../context/UserContext"; // Import useUser hook

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, loading } = useUser();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-gray-800 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              BookNGo
            </Link>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <>
              <div className="hidden sm:flex space-x-4">
                <Link
                  href="/activity"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  Activity
                </Link>
                <Link
                  href="/team"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  Team
                </Link>
                <Link
                  href="/inventory"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  Inventory
                </Link>
                <Link
                  href="/calendar"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                >
                  Calendar
                </Link>
              </div>
            </>
          )}

          {/* Right Side: Profile & Logout */}
          <div className="hidden sm:flex items-center space-x-4">
            {loading ? (
              <span>Loading...</span>
            ) : user ? (
              <>
                <span className="text-sm font-medium">
                  {user.customer_name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-3 py-2 rounded-md text-sm font-medium bg-blue-500 hover:bg-blue-600"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden p-2 text-lg focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "✖" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}

      {isOpen && (
        <div className="sm:hidden px-2 pb-3 space-y-1">
          {user && (
            <>
              <Link
                href="/activity"
                className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Activity
              </Link>
              <Link
                href="/team"
                className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Team
              </Link>
              <Link
                href="/inventory"
                className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Inventory
              </Link>
              <Link
                href="/calendar"
                className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Calendar
              </Link>
            </>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="block px-3 py-2 rounded-md text-sm font-medium bg-blue-500 hover:bg-blue-600"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
