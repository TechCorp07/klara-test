"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import LoadingComponent from "@/components/ui/LoadingComponent"

/**
 * Dashboard router component
 * Redirects to the appropriate dashboard based on user role
 */
export default function DashboardRouter() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/auth/login")
        return
      }

      if (user) {
        const dashboardRoute = `/dashboard/${user.role}`
        router.push(dashboardRoute)
      }
    }
  }, [loading, isAuthenticated, user, router])

  return <LoadingComponent />
}
