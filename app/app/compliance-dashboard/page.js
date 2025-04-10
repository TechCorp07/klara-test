"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { auditService } from "@/lib/services/auditService"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { toast } from "react-toastify"

export default function ComplianceDashboard() {
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch audit logs
  const { data: auditLogs = { results: [] } } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: () => auditService.getAuditLogs({ limit: 5 }),
    enabled: !!user && mounted,
    onError: (error) => {
      if (mounted) {
        toast.error("Failed to load audit logs")
      }
      console.error("Error fetching audit logs:", error)
    },
  })

  // Fetch compliance reports
  const { data: complianceReports = { results: [] } } = useQuery({
    queryKey: ["complianceReports"],
    queryFn: () => auditService.getComplianceReports(),
    enabled: !!user && mounted,
    onError: (error) => {
      if (mounted) {
        toast.error("Failed to load compliance reports")
      }
      console.error("Error fetching compliance reports:", error)
    },
  })

  // Fetch security incidents
  const { data: securityIncidents = { results: [] } } = useQuery({
    queryKey: ["securityIncidents"],
    queryFn: () => auditService.getSecurityIncidents(),
    enabled: !!user && mounted,
    onError: (error) => {
      if (mounted) {
        toast.error("Failed to load security incidents")
      }
      console.error("Error fetching security incidents:", error)
    },
  })

  // Fetch compliance metrics
  const { data: complianceMetrics = { pending_reviews: [] } } = useQuery({
    queryKey: ["complianceMetrics"],
    queryFn: () => auditService.getComplianceMetrics(),
    enabled: !!user && mounted,
    onError: (error) => {
      if (mounted) {
        toast.error("Failed to load compliance metrics")
      }
      console.error("Error fetching compliance metrics:", error)
    },
  })

  // Redirect if user is not a compliance officer
  useEffect(() => {
    if (mounted && user && user.role !== "compliance") {
      window.location.href = "/dashboard"
    }
  }, [user, mounted])

  // Don't render anything during SSR
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.first_name || "Compliance Officer"}!</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Audit Events Today</h2>
          <p className="text-3xl font-bold text-blue-600">{complianceMetrics?.audit_events_today || 0}</p>
          <Link href="/compliance/audit-log" className="text-blue-600 hover:text-blue-800 text-sm">
            View logs →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Security Incidents</h2>
          <p className="text-3xl font-bold text-red-600">{complianceMetrics?.security_incidents_count || 0}</p>
          <Link href="/compliance/security" className="text-blue-600 hover:text-blue-800 text-sm">
            View incidents →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Compliance Score</h2>
          <p className="text-3xl font-bold text-green-600">{complianceMetrics?.compliance_score || 0}%</p>
          <Link href="/compliance/reports" className="text-blue-600 hover:text-blue-800 text-sm">
            View details →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Pending Reviews</h2>
          <p className="text-3xl font-bold text-yellow-600">{complianceMetrics?.pending_reviews_count || 0}</p>
          <Link href="/compliance/reviews" className="text-blue-600 hover:text-blue-800 text-sm">
            View reviews →
          </Link>
        </div>
      </div>

      {/* Audit Logs and Security Incidents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Audit Logs</h2>
            <Link href="/compliance/audit-log" className="text-blue-600 hover:text-blue-800 text-sm">
              View all
            </Link>
          </div>

          {auditLogs?.results && auditLogs.results.length > 0 ? (
            <div className="space-y-4">
              {auditLogs.results.slice(0, 5).map((log) => (
                <div key={log.id} className="border-b pb-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{log.action}</p>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        log.severity === "high"
                          ? "bg-red-100 text-red-800"
                          : log.severity === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    User: {log.user_name} ({log.user_role})
                  </p>
                  <p className="text-sm text-gray-600">Time: {new Date(log.timestamp).toLocaleString()}</p>
                  <p className="text-sm text-gray-600">IP: {log.ip_address}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No audit logs found.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Security Incidents</h2>
            <Link href="/compliance/security" className="text-blue-600 hover:text-blue-800 text-sm">
              View all
            </Link>
          </div>

          {securityIncidents?.results && securityIncidents.results.length > 0 ? (
            <div className="space-y-4">
              {securityIncidents.results.slice(0, 5).map((incident) => (
                <div key={incident.id} className="border-b pb-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{incident.title}</p>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        incident.status === "open"
                          ? "bg-red-100 text-red-800"
                          : incident.status === "investigating"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Type: {incident.incident_type}</p>
                  <p className="text-sm text-gray-600">
                    Reported: {new Date(incident.reported_at).toLocaleDateString()}
                  </p>
                  <div className="flex justify-end mt-1">
                    <Link
                      href={`/compliance/security/${incident.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No security incidents found.</p>
          )}
        </div>
      </div>

      {/* Compliance Reports and Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Compliance Reports</h2>
            <Link href="/compliance/reports" className="text-blue-600 hover:text-blue-800 text-sm">
              View all
            </Link>
          </div>

          {complianceReports?.results && complianceReports.results.length > 0 ? (
            <div className="space-y-4">
              {complianceReports.results.slice(0, 5).map((report) => (
                <div key={report.id} className="border-b pb-3">
                  <p className="font-medium">{report.title}</p>
                  <p className="text-sm text-gray-600">
                    Period: {report.period_start} to {report.period_end}
                  </p>
                  <p className="text-sm text-gray-600">
                    Generated: {new Date(report.generated_at).toLocaleDateString()}
                  </p>
                  <div className="flex justify-end mt-1 space-x-2">
                    <Link
                      href={`/compliance/reports/${report.id}`}
                      className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
                    >
                      View
                    </Link>
                    <Link
                      href={`/compliance/reports/${report.id}/download`}
                      className="text-sm bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded"
                    >
                      Download
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No compliance reports found.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Pending Reviews</h2>
            <Link href="/compliance/reviews" className="text-blue-600 hover:text-blue-800 text-sm">
              View all
            </Link>
          </div>

          {complianceMetrics?.pending_reviews && complianceMetrics.pending_reviews.length > 0 ? (
            <div className="space-y-4">
              {complianceMetrics.pending_reviews.slice(0, 5).map((review, index) => (
                <div key={index} className="border-b pb-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{review.title}</p>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        review.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : review.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {review.priority.charAt(0).toUpperCase() + review.priority.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Type: {review.review_type}</p>
                  <p className="text-sm text-gray-600">Due: {review.due_date}</p>
                  <div className="flex justify-end mt-1">
                    <Link
                      href={`/compliance/reviews/${review.id}`}
                      className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
                    >
                      Start Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No pending reviews.</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/compliance/reports/generate"
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
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Generate Report</span>
            </div>
          </Link>

          <Link
            href="/compliance/security/new"
            className="bg-red-100 hover:bg-red-200 text-red-800 p-4 rounded-lg text-center"
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>Report Incident</span>
            </div>
          </Link>

          <Link
            href="/compliance/audit-log/search"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>Search Audit Logs</span>
            </div>
          </Link>

          <Link
            href="/compliance/training"
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span>Compliance Training</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Compliance Resources */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Compliance Resources</h2>
          <Link href="/compliance/resources" className="text-blue-600 hover:text-blue-800 text-sm">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">HIPAA Guidelines</h3>
            <p className="text-sm text-gray-600 mb-2">
              Access the latest HIPAA compliance guidelines and requirements.
            </p>
            <Link href="/compliance/resources/hipaa" className="text-blue-600 hover:text-blue-800 text-sm">
              View guidelines →
            </Link>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Security Policies</h3>
            <p className="text-sm text-gray-600 mb-2">Review organizational security policies and procedures.</p>
            <Link href="/compliance/resources/security-policies" className="text-blue-600 hover:text-blue-800 text-sm">
              View policies →
            </Link>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Audit Procedures</h3>
            <p className="text-sm text-gray-600 mb-2">Access audit procedures and compliance checklists.</p>
            <Link href="/compliance/resources/audit-procedures" className="text-blue-600 hover:text-blue-800 text-sm">
              View procedures →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
