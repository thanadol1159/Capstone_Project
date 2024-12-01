import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isPublicPath = path === "/login" || path === "/signup";

  const token = request.cookies.get("persist:root")?.value || "";

  // Check if token exists in persisted state
  const isPersistTokenValid = token && token !== "null";

  // If on public path and authenticated, redirect to dashboard
  if (isPublicPath && isPersistTokenValid) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If on protected path without token, redirect to login
  if (!isPublicPath && !isPersistTokenValid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}


export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/login",
    "/signup",
    // "/venue/manage"
    // "/venue/manage",
    // "/venue/booking",
  ],
};
