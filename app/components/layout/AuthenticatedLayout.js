"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"]

export default function AuthenticatedLayout({ children }) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip redirect during loading
    if (loading) return

    // Check if current route is public
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

    // Redirect to login if not authenticated and not on a public route
    if (!isAuthenticated && !isPublicRoute) {
      router.push("/login")
    }

    // Redirect to dashboard if authenticated and on a public route
    if (isAuthenticated && isPublicRoute) {
      // Redirect to appropriate dashboard based on user role
      if (user?.role === "patient") {
        router.push("/dashboard")
      } else if (user?.role === "provider") {
        router.push("/dashboard")
      } else if (user?.role === "pharmco") {
        router.push("/dashboard")
      } else if (user?.role === "admin" || user?.role === "superadmin") {
        router.push("/admin/dashboard")
      } else if (user?.role === "caregiver") {
        router.push("/dashboard")
      } else if (user?.role === "researcher") {
        router.push("/dashboard")
      } else if (user?.role === "compliance") {
        router.push("/compliance/dashboard")
      } else {
        router.push("/dashboard")
      }
    }
  }, [loading, isAuthenticated, pathname, router, user])

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // For public routes, render children directly
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return children
  }

  // For protected routes, only render if authenticated
  return isAuthenticated ? children : null
}
