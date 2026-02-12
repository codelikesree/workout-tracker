import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workout/:path*",
    "/workouts/:path*",
    "/templates/:path*",
    "/history/:path*",
    "/analytics/:path*",
    "/import/:path*",
    "/profile/:path*",
    "/api/workouts/:path*",
    "/api/templates/:path*",
    "/api/analytics/:path*",
    "/api/users/:path*",
    "/api/dashboard/:path*",
  ],
};
