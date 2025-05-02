"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/api/client"
import LoadingComponent from "@/components/ui/LoadingComponent"
import ErrorComponent from "@/components/ui/ErrorComponent"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import StatsCard from "@/components/dashboard/StatsCard"
import DataPanel from "@/components/dashboard/DataPanel"
import QuickActionButton from "@/components/dashboard/QuickActionButton"

/**
 * Superadmin dashboard client component
 * Displays system-wide information and administrative actions
 */
const SuperadminClient = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recentAlerts, setRecentAlerts] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    systemAlerts: 0,
    securityIssues: 0,
  })

  useEffect(() => {
    const fetchSuperadminData = async () => {
      try {
        setLoading(true)

        // Fetch recent system alerts
        const alertsResponse = await apiClient.request("GET", "/superadmin/alerts/recent", null, {
          errorMessage: "Failed to fetch recent alerts",
        })

        // Fetch system-wide stats
        const statsResponse = await apiClient.request("GET", "/superadmin/stats", null, {
          errorMessage: "Failed to fetch system stats",
        })

        setRecentAlerts(alertsResponse.data || [])
        setStats(
          statsResponse.data || {
            totalUsers: 0,
            activeUsers: 0,
            systemAlerts: 0,
            securityIssues: 0,
          },
        )

        setLoading(false)
      } catch (err) {
        console.error("Error fetching superadmin data:", err)
        setError(err.message || "Failed to load superadmin dashboard")
        setLoading(false)
      }
    }

    fetchSuperadminData()
  }, [user?.id])

  if (loading) return <LoadingComponent />
  if (error) return <ErrorComponent message={error} />

  return (
    <DashboardLayout title="Superadmin Dashboard" subtitle={`Welcome, ${user?.firstName || "Administrator"}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Users" value={stats.totalUsers} icon="users" trend={null} />
        <StatsCard title="Active Users" value={stats.activeUsers} icon="user-check" trend={null} />
        <StatsCard
          title="System Alerts"
          value={stats.systemAlerts}
          icon="alert-circle"
          trend={null}
          trendDirection={stats.systemAlerts > 5 ? "negative" : "neutral"}
        />
        <StatsCard
          title="Security Issues"
          value={stats.securityIssues}
          icon="shield"
          trend={null}
          trendDirection={stats.securityIssues > 0 ? "negative" : "positive"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataPanel
            title="Recent System Alerts"
            data={recentAlerts}
            emptyMessage="No recent alerts"
            renderItem={(alert) => (
              <div key={alert.id} className="p-4 border-b flex justify-between items-center">
                <div>
                  <h3
                    className={`font-medium ${
                      alert.severity === "critical"
                        ? "text-red-600"
                        : alert.severity === "warning"
                          ? "text-yellow-600"
                          : "text-blue-600"
                    }`}
                  >
                    {alert.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {alert.timestamp} • {alert.source}
                  </p>
                </div>
                <button className="text-blue-600 hover:text-blue-800">View Details</button>
              </div>
            )}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Administrative Actions</h2>
          <div className="space-y-3">
            <QuickActionButton icon="user-plus" label="Manage Users" onClick={() => {}} />
            <QuickActionButton icon="settings" label="System Configuration" onClick={() => {}} />
            <QuickActionButton icon="shield" label="Security Settings" onClick={() => {}} />
            <QuickActionButton icon="database" label="Database Management" onClick={() => {}} />
            <QuickActionButton icon="file-text" label="View Audit Logs" onClick={() => {}} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default SuperadminClient
