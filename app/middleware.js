import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export function middleware(request) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password"]
  const isPublicPath = publicPaths.some((publicPath) => path.startsWith(publicPath))

  // Check if user is authenticated
  const cookieStore = cookies()
  const accessToken = cookieStore.get("access_token")?.value
  const isAuthenticated = !!accessToken

  // If the path is public, allow access
  if (isPublicPath) {
    // If user is authenticated and trying to access public path, redirect to dashboard
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  // If the path is protected and user is not authenticated, redirect to login
  if (!isAuthenticated) {
    const url = new URL("/login", request.url)
    url.searchParams.set("from", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Continue to the protected route
  return NextResponse.next()
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    // Apply to all routes except API routes, static files, and images
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
