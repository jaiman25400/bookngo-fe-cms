"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Static navigation links (only shown in protected routes)
  const navLinks = [
    { href: "/activity", label: "Activity" },
    { href: "/team", label: "Team" },
    { href: "/inventory", label: "Inventory" },
    { href: "/zone", label: "Zone" },
    { href: "/profile", label: "Profile" },
  ];

  // Close mobile menu when navigation occurs
  useEffect(() => setIsOpen(false), [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      window.location.href = "/login"; // Full page reload to clear state
    } catch (error) {
      console.error("Logout error:", error);
    }
    setIsOpen(false);
  };

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link
              href="/"
              className="text-xl font-bold hover:text-gray-300 transition-colors"
            >
              BookNGo
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex flex-1 justify-center items-center">
            <div className="flex space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Logout Button */}
          <div className="hidden sm:flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors"
              aria-label="Logout"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden p-2 hover:bg-gray-700 rounded-md transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden px-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}