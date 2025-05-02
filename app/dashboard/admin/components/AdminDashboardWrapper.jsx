"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

// Import the dashboard client with no SSR
const DashboardClient = dynamic(() => import("./DashboardClient"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      <span className="ml-3 text-gray-600">Loading dashboard...</span>
    </div>
  ),
})

export default function AdminDashboardWrapper() {
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

    // Check if user has admin role
    if (user.role !== "admin") {
      // Redirect to appropriate dashboard based on role
      switch (user.role) {
        case "patient":
          router.push("/dashboard/patient")
          break
        case "provider":
          router.push("/dashboard/provider")
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

  // Render the dashboard client
  return <DashboardClient />
}
