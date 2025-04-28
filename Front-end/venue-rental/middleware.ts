import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const roleCookie = request.cookies.get("role");
  const role = roleCookie ? roleCookie.value : "";

  console.log(
    `Middleware: Checking access for path "${path}" with role "${role}"`
  );

  const protectedRoutes: { [key: string]: string } = {
    "/admins": "Admin",
    "/dashboard": "User",
  };

  for (const route in protectedRoutes) {
    if (path.startsWith(route) && role !== protectedRoutes[route]) {
      console.warn(`Unauthorized access to "${path}". Redirecting...`);
      return NextResponse.redirect(new URL("/nk1", request.url));
    }
  }

  // const url = request.nextUrl;
  // if (url.protocol === "http:") {
  //   url.protocol = "https:";
  //   return NextResponse.redirect(url);
  // }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admins/:path*"],
};
