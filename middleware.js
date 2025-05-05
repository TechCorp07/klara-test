// middleware.js
import { NextResponse } from "next/server"

// Public paths that don't require authentication
const publicPaths = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/request-verification",
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/auth/me",
  "/api/auth/verify-2fa",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/setup-2fa",
  "/api/auth/confirm-2fa",
  "/api/auth/disable-2fa",
]

// This middleware runs on every request
export function middleware(request) {
  const { pathname } = request.nextUrl

  // Check if the path is public or requires authentication
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // Check for authentication token in cookies
  const authToken = request.cookies.get("auth_token")?.value
  const refreshToken = request.cookies.get("refresh_token")?.value

  // Create the response
  let response

  // If the path requires authentication and no token exists, redirect to login
  if (!isPublicPath && !authToken && !refreshToken) {
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  // If user is authenticated and trying to access login page, redirect to dashboard
  if ((pathname === "/auth/login" || pathname === "/") && authToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Get the response for the original request
  response = NextResponse.next()

  // Add CORS headers for all origins we want to support
  const allowedOrigins = [
    "https://klararety.com",
    "https://api.klararety.com",
    "http://localhost:3000",
    "http://localhost:8000",
  ]

  const origin = request.headers.get("origin")

  // If the origin is in our allowed list, set it specifically
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
  } else if (process.env.NODE_ENV === "development") {
    // Use wildcard only in development
    response.headers.set("Access-Control-Allow-Origin", "*")
  }

  // Add security headers for healthcare applications
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

  // Set other CORS headers
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization")
  response.headers.set("Access-Control-Allow-Credentials", "true")

  // Handle preflight OPTIONS requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    })
  }

  return response
}

// Configure the middleware to run on all paths excluding static files
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public image files)
     */
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
}