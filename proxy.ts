import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Protect the /home route
  if (pathname.startsWith("/home")) {
    if (!token) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  // Redirect signed-in users away from /signin
  if (pathname.startsWith("/signin")) {
    if (token) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/signin"],
};
