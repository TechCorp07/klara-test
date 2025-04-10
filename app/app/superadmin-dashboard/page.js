"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { auditService } from "@/lib/services/auditService"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { toast } from "react-toastify"

export default function SuperAdminDashboard() {
  const { user } = useAuth()

  // Fetch system stats
  const { data: systemStats } = useQuery({
    queryKey: ["systemStats"],
    queryFn: () => auditService.getSystemStats(),
    enabled: !!user,
    onError: (error) => {
      toast.error("Failed to load system statistics")
      console.error("Error fetching system stats:", error)
    },
  })

  // Fetch organization stats
  const { data: orgStats } = useQuery({
    queryKey: ["organizationStats"],
    queryFn: () => auditService.getOrganizationStats(),
    enabled: !!user,
    onError: (error) => {
      toast.error("Failed to load organization statistics")
      console.error("Error fetching organization stats:", error)
    },
  })

  // Fetch admin users
  const { data: adminUsers } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => auditService.getAdminUsers(),
    enabled: !!user,
    onError: (error) => {
      toast.error("Failed to load admin users")
      console.error("Error fetching admin users:", error)
    },
  })

  // Fetch critical alerts
  const { data: criticalAlerts } = useQuery({
    queryKey: ["criticalAlerts"],
    queryFn: () => auditService.getCriticalAlerts(),
    enabled: !!user,
    onError: (error) => {
      toast.error("Failed to load critical alerts")
      console.error("Error fetching critical alerts:", error)
    },
  })

  // Redirect if user is not a superadmin
  useEffect(() => {
    if (user && user.role !== "superadmin") {
      window.location.href = "/dashboard"
    }
  }, [user])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.first_name || "Super Administrator"}!</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Organizations</h2>
          <p className="text-3xl font-bold text-blue-600">{orgStats?.organization_count || 0}</p>
          <Link href="/superadmin/organizations" className="text-blue-600 hover:text-blue-800 text-sm">
            Manage →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Admin Users</h2>
          <p className="text-3xl font-bold text-purple-600">{adminUsers?.total_count || 0}</p>
          <Link href="/superadmin/admins" className="text-blue-600 hover:text-blue-800 text-sm">
            Manage →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Critical Alerts</h2>
          <p className="text-3xl font-bold text-red-600">{criticalAlerts?.total_count || 0}</p>
          <Link href="/superadmin/alerts" className="text-blue-600 hover:text-blue-800 text-sm">
            View alerts →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">System Health</h2>
          <p className="text-3xl font-bold text-green-600">{systemStats?.system_health || 0}%</p>
          <Link href="/superadmin/system" className="text-blue-600 hover:text-blue-800 text-sm">
            View details →
          </Link>
        </div>
      </div>

      {/* Organizations and Admin Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Organizations</h2>
            <Link href="/superadmin/organizations" className="text-blue-600 hover:text-blue-800 text-sm">
              View all
            </Link>
          </div>

          {orgStats && orgStats.organizations && orgStats.organizations.length > 0 ? (
            <div className="space-y-4">
              {orgStats.organizations.slice(0, 5).map((org, index) => (
                <div key={index} className="border-b pb-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{org.name}</p>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        org.status === "active"
                          ? "bg-green-100 text-green-800"
                          : org.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Users: {org.user_count}</p>
                  <p className="text-sm text-gray-600">Created: {new Date(org.created_at).toLocaleDateString()}</p>
                  <div className="flex justify-end mt-1">
                    <Link
                      href={`/superadmin/organizations/${org.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Manage →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No organizations found.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Admin Users</h2>
            <Link href="/superadmin/admins" className="text-blue-600 hover:text-blue-800 text-sm">
              View all
            </Link>
          </div>

          {adminUsers && adminUsers.results && adminUsers.results.length > 0 ? (
            <div className="space-y-4">
              {adminUsers.results.slice(0, 5).map((admin) => (
                <div key={admin.id} className="border-b pb-3">
                  <div className="flex justify-between">
                    <p className="font-medium">
                      {admin.first_name} {admin.last_name}
                    </p>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        admin.status === "active"
                          ? "bg-green-100 text-green-800"
                          : admin.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Email: {admin.email}</p>
                  <p className="text-sm text-gray-600">Organization: {admin.organization_name}</p>
                  <p className="text-sm text-gray-600">
                    Last Login: {admin.last_login ? new Date(admin.last_login).toLocaleString() : "Never"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No admin users found.</p>
          )}
        </div>
      </div>

      {/* Critical Alerts and System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Critical Alerts</h2>
            <Link href="/superadmin/alerts" className="text-blue-600 hover:text-blue-800 text-sm">
              View all
            </Link>
          </div>

          {criticalAlerts && criticalAlerts.results && criticalAlerts.results.length > 0 ? (
            <div className="space-y-4">
              {criticalAlerts.results.slice(0, 5).map((alert) => (
                <div key={alert.id} className="border-b pb-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{alert.title}</p>
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Critical</span>
                  </div>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                  <p className="text-sm text-gray-600">Time: {new Date(alert.created_at).toLocaleString()}</p>
                  <div className="flex justify-end mt-1">
                    <button className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded">
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No critical alerts found.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">System Health</h2>
            <Link href="/superadmin/system" className="text-blue-600 hover:text-blue-800 text-sm">
              View details
            </Link>
          </div>

          {systemStats && systemStats.system_metrics ? (
            <div className="space-y-4">
              <div className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <p className="font-medium">API Server</p>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      systemStats.system_metrics.api_health > 90
                        ? "bg-green-100 text-green-800"
                        : systemStats.system_metrics.api_health > 70
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {systemStats.system_metrics.api_health}% Healthy
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${systemStats.system_metrics.api_health}%` }}
                  ></div>
                </div>
              </div>

              <div className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Database</p>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      systemStats.system_metrics.db_health > 90
                        ? "bg-green-100 text-green-800"
                        : systemStats.system_metrics.db_health > 70
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {systemStats.system_metrics.db_health}% Healthy
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{ width: `${systemStats.system_metrics.db_health}%` }}
                  ></div>
                </div>
              </div>

              <div className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Storage</p>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      systemStats.system_metrics.storage_usage < 70
                        ? "bg-green-100 text-green-800"
                        : systemStats.system_metrics.storage_usage < 90
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {systemStats.system_metrics.storage_usage}% Used
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-yellow-600 h-2.5 rounded-full"
                    style={{ width: `${systemStats.system_metrics.storage_usage}%` }}
                  ></div>
                </div>
              </div>

              <div className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Memory</p>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      systemStats.system_metrics.memory_usage < 70
                        ? "bg-green-100 text-green-800"
                        : systemStats.system_metrics.memory_usage < 90
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {systemStats.system_metrics.memory_usage}% Used
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full"
                    style={{ width: `${systemStats.system_metrics.memory_usage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No system health data available.</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Super Admin Actions</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/superadmin/organizations/new"
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-lg text-center"
          >
            <div className="flex flex-col items-center">
              <svg
                className="h-8 w-8 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span>Add Organization</span>
            </div>
          </Link>

          <Link
            href="/superadmin/admins/new"
            className="bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-lg text-center"
          >
            <div className="flex flex-col items-center">
              <svg
                className="h-8 w-8 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              <span>Add Admin</span>
            </div>
          </Link>

          <Link
            href="/superadmin/system/maintenance"
            className="bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-lg text-center"
          >
            <div className="flex flex-col items-center">
              <svg
                className="h-8 w-8 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>System Maintenance</span>
            </div>
          </Link>

          <Link
            href="/superadmin/system/backup"
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-4 rounded-lg text-center"
          >
            <div className="flex flex-col items-center">
              <svg
                className="h-8 w-8 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              <span>System Backup</span>
            </div>
          </Link>
        </div>
      </div>

      {/* System Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">System Configuration</h2>
          <Link href="/superadmin/configuration" className="text-blue-600 hover:text-blue-800 text-sm">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Global Settings</h3>
            <p className="text-sm text-gray-600 mb-2">Configure global system settings and parameters.</p>
            <Link href="/superadmin/configuration/global" className="text-blue-600 hover:text-blue-800 text-sm">
              Configure →
            </Link>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Security Settings</h3>
            <p className="text-sm text-gray-600 mb-2">Configure security policies and authentication settings.</p>
            <Link href="/superadmin/configuration/security" className="text-blue-600 hover:text-blue-800 text-sm">
              Configure →
            </Link>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">API Configuration</h3>
            <p className="text-sm text-gray-600 mb-2">Configure API settings, rate limits, and integrations.</p>
            <Link href="/superadmin/configuration/api" className="text-blue-600 hover:text-blue-800 text-sm">
              Configure →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
