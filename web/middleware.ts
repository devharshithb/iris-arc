// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Wrap withAuth to get session on the edge
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token; // present if signed in

    // 🔒 If user is logged in and tries to access /login or /signup → redirect home
    if (token && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 🧭 If user not logged in and tries to access protected page → /login
    if (!token && pathname !== "/login" && pathname !== "/signup") {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", req.url); // so you can return after login
      return NextResponse.redirect(loginUrl);
    }

    // ✅ Otherwise allow request
    return NextResponse.next();
  },
  {
    callbacks: {
      // Return token for session detection
      authorized: () => true,
    },
  }
);

// ✅ Exclude API and static assets
export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|static|assets|public).*)",
  ],
};
