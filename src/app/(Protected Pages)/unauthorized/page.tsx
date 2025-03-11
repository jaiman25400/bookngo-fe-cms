import Link from "next/link";

// app/unauthorized/page.tsx
export default function Unauthorized() {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            You don't have permission to access this resource.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Return to Home Page
            </Link>
          </div>
        </div>
      </div>
    );
  }