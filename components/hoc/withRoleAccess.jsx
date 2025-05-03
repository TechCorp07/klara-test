"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"

/**
 * Higher-order component that restricts access based on user roles
 * @param {React.ComponentType} Component - The component to wrap
 * @param {string[]} allowedRoles - Array of roles that can access the component
 * @returns {React.ComponentType} - The wrapped component with role-based access control
 */
export function withRoleAccess(Component, allowedRoles = []) {
  // Return a new component that checks the user's role
  return function ProtectedComponent(props) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
      // If auth is still loading, wait
      if (loading) return

      // If no user is logged in, redirect to login
      if (!user) {
        router.push("/auth/login?redirect=" + encodeURIComponent(window.location.pathname))
        return
      }

      // Check if user has an allowed role
      const hasAllowedRole = allowedRoles.length === 0 || allowedRoles.includes(user.role)

      if (!hasAllowedRole) {
        // Redirect to appropriate dashboard based on role
        switch (user.role) {
          case "patient":
            router.push("/dashboard/patient")
            break
          case "provider":
            router.push("/dashboard/provider")
            break
          case "admin":
            router.push("/dashboard/admin")
            break
          case "compliance":
            router.push("/dashboard/compliance")
            break
          default:
            router.push("/dashboard")
        }
        return
      }

      // User is authorized
      setAuthorized(true)
    }, [user, loading, router])

    // Show loading state while checking authorization
    if (loading || !authorized) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <span className="ml-3 text-gray-600">Checking authorization...</span>
        </div>
      )
    }

    // Render the protected component
    return <Component {...props} />
  }
}

export default withRoleAccess
