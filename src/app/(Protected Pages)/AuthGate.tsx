"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CMS_TOKEN_KEY } from "@/app/utils/api";

/**
 * Blocks protected UI until we confirm a CMS token exists; otherwise sends the user to login.
 * Middleware cannot read localStorage, so this runs on the client.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token =
      window.localStorage.getItem(CMS_TOKEN_KEY) ||
      window.sessionStorage.getItem(CMS_TOKEN_KEY);
    if (!token) {
      router.replace("/login");
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
