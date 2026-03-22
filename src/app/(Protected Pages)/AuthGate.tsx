"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { checkCmsAuthSession } from "@/app/utils/api";

/**
 * CMS uses httpOnly cookie `token` on the API host (not readable in JS).
 * Validates session with GET /auth/me + credentials.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<
    "loading" | "ok" | "unauthenticated" | "error"
  >("loading");

  const runCheck = useCallback(async () => {
    setState("loading");
    const result = await checkCmsAuthSession();
    if (result === "authenticated") setState("ok");
    else if (result === "unauthenticated") {
      router.replace("/login");
    } else {
      setState("error");
    }
  }, [router]);

  useEffect(() => {
    void runCheck();
  }, [runCheck]);

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        Loading…
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center text-slate-700">
        <p className="max-w-md">
          Could not verify your session with the API. Check your connection and
          that the API allows{" "}
          <code className="rounded bg-slate-200 px-1 text-sm">credentials</code>{" "}
          from this site.
        </p>
        <button
          type="button"
          onClick={() => void runCheck()}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (state === "ok") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
      Redirecting…
    </div>
  );
}
