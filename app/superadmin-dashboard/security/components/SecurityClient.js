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
 * Security dashboard client component for superadmins
 * Displays security-related information and actions
 */
const SecurityClient = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [securityEvents, setSecurityEvents] = useState([])
  const [stats, setStats] = useState({
    activeThreats: 0,
    vulnerabilities: 0,
    securityScore: 0,
    lastAudit: null,
  })

  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        setLoading(true)

        // Fetch recent security events
        const eventsResponse = await apiClient.request("GET", "/security/events/recent", null, {
          errorMessage: "Failed to fetch security events",
        })

        // Fetch security stats
        const statsResponse = await apiClient.request("GET", "/security/stats", null, {
          errorMessage: "Failed to fetch security stats",
        })

        setSecurityEvents(eventsResponse.data || [])
        setStats(
          statsResponse.data || {
            activeThreats: 0,
            vulnerabilities: 0,
            securityScore: 0,
            lastAudit: null,
          },
        )

        setLoading(false)
      } catch (err) {
        console.error("Error fetching security data:", err)
        setError(err.message || "Failed to load security dashboard")
        setLoading(false)
      }
    }

    fetchSecurityData()
  }, [user?.id])

  if (loading) return <LoadingComponent />
  if (error) return <ErrorComponent message={error} />

  return (
    <DashboardLayout title="Security Dashboard" subtitle="System Security Overview">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Active Threats"
          value={stats.activeThreats}
          icon="shield-alert"
          trend={null}
          trendDirection={stats.activeThreats > 0 ? "negative" : "positive"}
        />
        <StatsCard
          title="Vulnerabilities"
          value={stats.vulnerabilities}
          icon="alert-triangle"
          trend={null}
          trendDirection={stats.vulnerabilities > 5 ? "negative" : "neutral"}
        />
        <StatsCard
          title="Security Score"
          value={`${stats.securityScore}/100`}
          icon="shield"
          trend={null}
          trendDirection={stats.securityScore < 70 ? "negative" : stats.securityScore < 90 ? "neutral" : "positive"}
        />
        <StatsCard title="Last Audit" value={stats.lastAudit || "Never"} icon="clock" trend={null} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataPanel
            title="Recent Security Events"
            data={securityEvents}
            emptyMessage="No recent security events"
            renderItem={(event) => (
              <div key={event.id} className="p-4 border-b flex justify-between items-center">
                <div>
                  <h3
                    className={`font-medium ${
                      event.severity === "critical"
                        ? "text-red-600"
                        : event.severity === "high"
                          ? "text-orange-600"
                          : event.severity === "medium"
                            ? "text-yellow-600"
                            : "text-blue-600"
                    }`}
                  >
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {event.timestamp} • {event.source} • {event.ipAddress}
                  </p>
                </div>
                <button className="text-blue-600 hover:text-blue-800">Investigate</button>
              </div>
            )}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Security Actions</h2>
          <div className="space-y-3">
            <QuickActionButton icon="shield" label="Run Security Scan" onClick={() => {}} />
            <QuickActionButton icon="lock" label="Update Security Policies" onClick={() => {}} />
            <QuickActionButton icon="user-check" label="Review User Permissions" onClick={() => {}} />
            <QuickActionButton icon="file-text" label="Generate Security Report" onClick={() => {}} />
            <QuickActionButton icon="alert-triangle" label="View Vulnerabilities" onClick={() => {}} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default SecurityClient
