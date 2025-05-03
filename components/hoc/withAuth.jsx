"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import LoadingComponent from "@/components/ui/LoadingComponent"

/**
 * Higher-order component to protect routes that require authentication
 * @param {React.Component} Component - Component to wrap
 * @returns {React.Component} Protected component
 */
export default function withAuth(Component) {
  return function ProtectedRoute(props) {
    const { loading, isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
      // If authentication check is complete and user is not authenticated
      if (!loading && !isAuthenticated) {
        router.push("/auth/login")
      }
    }, [loading, isAuthenticated, router])

    // Show loading while checking authentication
    if (loading) {
      return <LoadingComponent />
    }

    // If not authenticated, don't render anything (will be redirected)
    if (!isAuthenticated) {
      return null
    }

    // Render the protected component
    return <Component {...props} />
  }
}
