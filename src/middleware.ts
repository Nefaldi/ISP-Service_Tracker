import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isRootPage = nextUrl.pathname === "/";
  const isLoginPage = nextUrl.pathname.startsWith("/login");
  const isRegisterPage = nextUrl.pathname.startsWith("/register");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isTechnicianRoute = nextUrl.pathname.startsWith("/technician");
  const isCustomerRoute = nextUrl.pathname.startsWith("/customer");
  const isCustomerTrackRoute = nextUrl.pathname.startsWith("/customer/track");
  const isProfileRoute = nextUrl.pathname.startsWith("/profile");

  // If user visits root path "/", redirect directly to their role dashboard or /login
  if (isRootPage) {
    if (isLoggedIn) {
      if (userRole === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", nextUrl));
      }
      if (userRole === "TEKNISI") {
        return NextResponse.redirect(new URL("/technician", nextUrl));
      }
      return NextResponse.redirect(new URL("/customer", nextUrl));
    }
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // If authenticated user visits login page, redirect to appropriate role portal
  if (isLoginPage && isLoggedIn) {
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
    if (userRole === "TEKNISI") {
      return NextResponse.redirect(new URL("/technician", nextUrl));
    }
    return NextResponse.redirect(new URL("/customer", nextUrl));
  }

  // Non-admin authenticated users cannot access registration page
  if (isRegisterPage && isLoggedIn && userRole !== "ADMIN") {
    if (userRole === "TEKNISI") {
      return NextResponse.redirect(new URL("/technician", nextUrl));
    }
    return NextResponse.redirect(new URL("/customer", nextUrl));
  }

  // If not authenticated, redirect to login with callback
  if (!isLoggedIn && (isAdminRoute || isTechnicianRoute || isCustomerRoute || isProfileRoute)) {
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

  // Customer route check: allow /customer/track to be viewed by ADMIN and TEKNISI for oversight
  if (isCustomerRoute && !isCustomerTrackRoute && userRole !== "CUSTOMER") {
    return NextResponse.redirect(
      new URL("/login?error=AccessDeniedCustomerRoleRequired", nextUrl)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/technician/:path*",
    "/customer/:path*",
    "/login",
    "/register",
  ],
};
