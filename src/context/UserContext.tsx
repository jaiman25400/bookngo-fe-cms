"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define the context type
interface UserContextType {
  user: any;
  loading: boolean;
  fetchUser: () => void;
  logout: () => void; // Add logout function
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const response = await fetch("http://localhost:3000/auth/me", {
        method: "GET",
        credentials: "include", // This ensures cookies are sent along with the request
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetch User :", data);
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call the logout API on the server to clear cookies
      const response = await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include", // Ensure cookies are included in the request
      });

      if (response.ok) {
        // After successful logout, clear the user state and redirect
        setUser(null);
        router.push("/login"); // Redirect to login page
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []); // Runs only on mount

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      const publicRoutes = ["/team/setup-password"]; // Allow setup-password page
      if (!publicRoutes.includes(window.location.pathname)) {
        console.log("User session expired. Redirecting to login.", user);
        router.push("/login");
      }
    }
  }, [loading, user, router]);

  return (
    <UserContext.Provider value={{ user, loading, fetchUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
