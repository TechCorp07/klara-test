import { NextResponse } from "next/server"

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"]

export default function middleware(request) {
  const { pathname } = request.nextUrl

  // Check if path is a public route or starts with /api
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
  const isApiRoute = pathname.startsWith("/api/")
  const isStaticAsset =
    pathname.startsWith("/_next/") || pathname.startsWith("/favicon.ico") || pathname.startsWith("/images/")

  // Get auth token from cookies
  const authToken = request.cookies.get("auth_token")?.value
  const userCookie = request.cookies.get("user")?.value

  // If route is not public and user is not authenticated, redirect to login
  if (!isPublicRoute && !isApiRoute && !isStaticAsset && (!authToken || !userCookie)) {
    const loginUrl = new URL("/login", request.url)
    // Only add callbackUrl if not already going to login
    if (!pathname.startsWith("/login")) {
      loginUrl.searchParams.set("callbackUrl", pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  // For authenticated users trying to access login/register pages, redirect to dashboard
  if (authToken && userCookie && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Add security headers
  const response = NextResponse.next()

  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Only add HSTS in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
  }

  return response
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Apply to all routes except _next and public assets
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
