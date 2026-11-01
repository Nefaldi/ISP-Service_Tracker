import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isAuthPage = nextUrl.pathname.startsWith("/login");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isTechnicianRoute = nextUrl.pathname.startsWith("/technician");
  const isCustomerRoute = nextUrl.pathname.startsWith("/customer");

  // If authenticated user visits login page, redirect to appropriate role portal
  if (isAuthPage && isLoggedIn) {
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
    if (userRole === "TEKNISI") {
      return NextResponse.redirect(new URL("/technician", nextUrl));
    }
    return NextResponse.redirect(new URL("/customer", nextUrl));
  }

  // If not authenticated, redirect to login with callback
  if (!isLoggedIn && (isAdminRoute || isTechnicianRoute || isCustomerRoute)) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  // Role-Based Access Control (RBAC) Enforcement
  if (isAdminRoute && userRole !== "ADMIN") {
    return NextResponse.redirect(
      new URL("/login?error=AccessDeniedAdminRoleRequired", nextUrl)
    );
  }

  if (isTechnicianRoute && userRole !== "TEKNISI") {
    return NextResponse.redirect(
      new URL("/login?error=AccessDeniedTechnicianRoleRequired", nextUrl)
    );
  }

  if (isCustomerRoute && userRole !== "CUSTOMER") {
    return NextResponse.redirect(
      new URL("/login?error=AccessDeniedCustomerRoleRequired", nextUrl)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/technician/:path*",
    "/customer/:path*",
    "/login",
  ],
};
