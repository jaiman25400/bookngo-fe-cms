import { Suspense } from "react";
import SetupPasswordClient from "./SetupPasswordClient";

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SetupPasswordClient />
    </Suspense>
  );
}

