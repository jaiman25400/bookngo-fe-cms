import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const publicPaths = ["/login", "/setup-password"];

const roleRestrictedPaths: Record<string, string[]> = {
  Manager: ["/activity/add", "/inventory/add", "/zone/add"],
  Team: ["/activity/add", "/inventory/add", "/zone/add", "/team/"],
};

function isRestricted(role: string, pathname: string): boolean {
  const restrictedPaths = roleRestrictedPaths[role];
  if (!restrictedPaths) return false;
  return restrictedPaths.some((path) => pathname.startsWith(path));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("Middleware: Requesting", pathname);

  // Allow public paths without authentication
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Retrieve token from cookies
  const token = request.cookies.get("token")?.value;
  if (!token) {
    console.log("No token, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secretKey);

    const userRole = payload.role as string;

    // Admin has unrestricted access
    if (userRole === "Admin") {
      return NextResponse.next();
    }

    // Check role-specific restrictions
    if (isRestricted(userRole, pathname)) {
      console.log(`${userRole} role not allowed to access ${pathname}`);
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
