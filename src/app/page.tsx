"use client"; // Ensure this is a client component

import { useUser } from "../context/UserContext";

export default function Home() {
  const { user, loading } = useUser();

  if (loading) {
    return <div className="text-center text-2xl p-10">Loading...</div>;
  }
                                                                
  return (
    <div className="text-center text-2xl p-10">
      {user ? `Welcome, ${user.name}!` : "Redirecting..."}
    </div>
  );
}
