// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const publicPaths = ["/login", "/auth/login"];
  const { pathname } = request.nextUrl;

  console.log("Middle Ware :",pathname)

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/auth/me")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  // Debugging: Print the token to the server console
  console.log("Token in Middleware:", token);  // Make sure this log is showing up
  
  if (!token) {
    console.log("No token, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}


export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],  // Allow static assets
};
