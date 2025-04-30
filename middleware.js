// middleware.js
import { NextResponse } from "next/server"

// This middleware runs on every request
export function middleware(request) {
  // Get the response
  const response = NextResponse.next()

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
  } else {
    // Otherwise use a wildcard (less secure but more permissive for development)
    response.headers.set("Access-Control-Allow-Origin", "*")
  }

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

// Configure the middleware to run on all paths
export const config = {
  matcher: "/:path*",
}
