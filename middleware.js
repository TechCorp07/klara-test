import { NextResponse } from "next/server"
import { isMaintenanceMode } from "./lib/env"

/**
 * Middleware function for Next.js
 * Handles authentication, maintenance mode, and role-based access control
 */
export function middleware(request) {
  const { pathname } = request.nextUrl

  // Check if the site is in maintenance mode
  if (isMaintenanceMode() && !pathname.startsWith("/maintenance")) {
    // Allow static assets and API routes
    if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
      return NextResponse.next()
    }

    // Redirect to maintenance page
    return NextResponse.redirect(new URL("/maintenance", request.url))
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
    "/auth/request-verification",
    "/maintenance",
    "/",
    "/about",
    "/contact",
  ]

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  // Allow access to public routes and static assets
  if (isPublicRoute || pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // Check for authentication token
  const token = request.cookies.get("access_token")?.value

  // If no token is found, redirect to login
  if (!token) {
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("redirect", encodeURIComponent(pathname))
    return NextResponse.redirect(url)
  }

  // Role-based access control for specific routes
  const userRole = request.cookies.get("user_role")?.value

  if (userRole) {
    // Define role-specific route patterns
    const roleRoutePatterns = {
      patient: [
        "/dashboard/patient",
        "/appointments",
        "/medical-records",
        "/medications",
        "/messages",
        "/health-tracking",
        "/community",
        "/patient-dashboard",
        "/settings",
      ],
      provider: ["/dashboard/provider", "/patients", "/appointments", "/telemedicine", "/ehr"],
      admin: ["/dashboard/admin", "/admin-dashboard"],
      compliance: ["/dashboard/compliance", "/compliance-dashboard"],
      caregiver: ["/dashboard/caregiver", "/patients", "/medications", "/appointments"],
      pharmco: ["/dashboard/pharmco", "/medications-management", "/patient-data", "/medication-reports"],
      researcher: ["/dashboard/researcher", "/research"],
      superadmin: ["/dashboard/superadmin", "/superadmin-dashboard"],
    }

    // Check if user is trying to access a route they don't have permission for
    const hasAccess = Object.entries(roleRoutePatterns).some(([role, patterns]) => {
      // If this is the user's role, they should have access to these patterns
      if (role === userRole) return true

      // If this is not the user's role, check if they're trying to access a route for this role
      return !patterns.some((pattern) => pathname.startsWith(pattern))
    })

    if (!hasAccess) {
      // Redirect to appropriate dashboard based on role
      const dashboardRoute = `/dashboard/${userRole}`
      return NextResponse.redirect(new URL(dashboardRoute, request.url))
    }
  }

  // Continue to the requested page
  return NextResponse.next()
}

/**
 * Configure which paths should trigger this middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next (Next.js internals)
     * 2. /api (API routes)
     * 3. /static (static files)
     * 4. /_vercel (Vercel internals)
     * 5. All files in the public folder
     */
    "/((?!_next|api|static|_vercel|favicon.ico|robots.txt).*)",
  ],
}
