"use client"

// components/hoc/withDashboard.jsx
// Higher-order component for dashboard pages

import React from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/DashboardComponents"

/**
 * HOC that wraps dashboard pages with common layout and authentication check
 *
 * @param {React.ComponentType} Component - Component to wrap
 * @param {Object} options - Configuration options
 * @param {string} options.title - Dashboard title
 * @param {string} options.requiredRole - Role required to access this dashboard
 * @param {string} options.redirectPath - Path to redirect if role check fails
 */
const withDashboard = (Component, { title, requiredRole = null, redirectPath = "/dashboard" } = {}) => {
  const WithDashboardComponent = (props) => {
    const { user, loading } = useAuth()
    const router = useRouter()

    // Redirect if user doesn't have required role
    React.useEffect(() => {
      if (!loading && user) {
        if (requiredRole && user.role !== requiredRole) {
          router.push(redirectPath)
        }
      }
    }, [user, loading, router])

    if (loading) {
      return <div className="container mx-auto px-4 py-8">Loading...</div>
    }

    if (!user) {
      return <div className="container mx-auto px-4 py-8">Please log in to access this page.</div>
    }

    return (
      <DashboardLayout title={title || `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard`}>
        <Component {...props} />
      </DashboardLayout>
    )
  }

  // Set display name for debugging
  WithDashboardComponent.displayName = `withDashboard(${Component.displayName || Component.name || "Component"})`

  return WithDashboardComponent
}

export default withDashboard
