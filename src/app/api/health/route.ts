import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "bookngo-fe-cms",
    timestamp: new Date().toISOString(),
  });
}

