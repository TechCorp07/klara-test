"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { toast } from "react-toastify"

export default function DashboardClient() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [complianceStats, setComplianceStats] = useState(null)
  const [recentAudits, setRecentAudits] = useState([])
  const [vulnerabilities, setVulnerabilities] = useState([])
  const [hipaaStats, setHipaaStats] = useState(null)

  useEffect(() => {
    // Simulate fetching compliance data
    const fetchComplianceData = async () => {
      try {
        // This would be replaced with actual API calls
        setTimeout(() => {
          setComplianceStats({
            total_compliance_score: 94.5,
            last_assessment: "2023-03-15",
            critical_issues: 2,
            medium_issues: 5,
            low_issues: 12,
          })

          setRecentAudits([
            { id: 1, type: "User Access Review", date: "2023-04-10", result: "Pass", issues: 1 },
            { id: 2, type: "Data Encryption Audit", date: "2023-03-28", result: "Pass", issues: 0 },
            { id: 3, type: "System Access Controls", date: "2023-03-15", result: "Warning", issues: 3 },
            { id: 4, type: "Backup Verification", date: "2023-03-01", result: "Pass", issues: 0 },
            { id: 5, type: "Security Patch Audit", date: "2023-02-15", result: "Fail", issues: 4 },
          ])

          setVulnerabilities([
            {
              id: 101,
              severity: "Critical",
              issue: "Unpatched Authentication Service",
              system: "Auth0",
              discovered: "2023-04-01",
              status: "In Progress",
            },
            {
              id: 102,
              severity: "High",
              issue: "Exposed API Endpoint",
              system: "Patient API",
              discovered: "2023-03-25",
              status: "Fixed",
            },
            {
              id: 103,
              severity: "Medium",
              issue: "Deprecated Encryption Algorithm",
              system: "Messaging System",
              discovered: "2023-03-20",
              status: "In Progress",
            },
            {
              id: 104,
              severity: "Low",
              issue: "Cookie Without Secure Flag",
              system: "Web Portal",
              discovered: "2023-03-15",
              status: "Fixed",
            },
            {
              id: 105,
              severity: "Critical",
              issue: "Unauthorized Data Access Possible",
              system: "Document Storage",
              discovered: "2023-04-05",
              status: "Open",
            },
          ])

          setHipaaStats({
            privacy_score: 96,
            security_score: 92,
            breach_notification: 100,
            patient_rights: 98,
            last_assessment_date: "2023-03-20",
            next_assessment_date: "2023-06-20",
          })

          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching compliance data:", error)
        toast.error("Failed to load compliance dashboard data")
        setLoading(false)
      }
    }

    fetchComplianceData()
  }, [])

  if (loading) {
    return (
      <DashboardLayout title="Compliance Dashboard" subtitle="Loading compliance data..." role="compliance">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Compliance Dashboard"
      subtitle="Monitor HIPAA compliance and security standards"
      role="compliance"
    >
      {/* Compliance Score */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Overall Compliance Score</h2>
            <p className="text-gray-500">Last assessment: {complianceStats.last_assessment}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="text-4xl font-bold text-blue-600">{complianceStats.total_compliance_score}%</span>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${
              complianceStats.total_compliance_score >= 90
                ? "bg-green-600"
                : complianceStats.total_compliance_score >= 80
                  ? "bg-yellow-500"
                  : "bg-red-600"
            }`}
            style={{ width: `${complianceStats.total_compliance_score}%` }}
          ></div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-red-600 font-bold text-lg">{complianceStats.critical_issues}</p>
            <p className="text-gray-500 text-sm">Critical Issues</p>
          </div>
          <div className="text-center">
            <p className="text-yellow-500 font-bold text-lg">{complianceStats.medium_issues}</p>
            <p className="text-gray-500 text-sm">Medium Issues</p>
          </div>
          <div className="text-center">
            <p className="text-blue-500 font-bold text-lg">{complianceStats.low_issues}</p>
            <p className="text-gray-500 text-sm">Low Issues</p>
          </div>
        </div>
      </div>

      {/* HIPAA Compliance */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">HIPAA Compliance</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Privacy Rule</span>
                <span className="text-sm font-medium text-gray-700">{hipaaStats.privacy_score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${hipaaStats.privacy_score}%` }}></div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Security Rule</span>
                <span className="text-sm font-medium text-gray-700">{hipaaStats.security_score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${hipaaStats.security_score}%` }}
                ></div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Breach Notification Rule</span>
                <span className="text-sm font-medium text-gray-700">{hipaaStats.breach_notification}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${hipaaStats.breach_notification}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Patient Rights</span>
                <span className="text-sm font-medium text-gray-700">{hipaaStats.patient_rights}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${hipaaStats.patient_rights}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">Compliance Assessment Schedule</h3>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Last Assessment:</span> {hipaaStats.last_assessment_date}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Next Assessment:</span> {hipaaStats.next_assessment_date}
              </p>
              <div className="mt-4">
                <a
                  href="/compliance-dashboard/assessment-history"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Assessment History →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Audits */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Audits</h2>
            <a href="/compliance-dashboard/audit-log" className="text-blue-600 hover:text-blue-800 text-sm">
              View All Audits →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Audit Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Result
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Issues
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentAudits.map((audit) => (
                  <tr key={audit.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{audit.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{audit.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          audit.result === "Pass"
                            ? "bg-green-100 text-green-800"
                            : audit.result === "Warning"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {audit.result}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{audit.issues}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Vulnerabilities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Security Vulnerabilities</h2>
            <a href="/compliance-dashboard/vulnerabilities" className="text-blue-600 hover:text-blue-800 text-sm">
              View All →
            </a>
          </div>
          <div className="space-y-4">
            {vulnerabilities.map((vuln) => (
              <div key={vuln.id} className="border-l-4 border-gray-200 p-4 bg-gray-50 rounded-r-lg">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-900">{vuln.issue}</h3>
                  <span
                    className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                      vuln.severity === "Critical"
                        ? "bg-red-100 text-red-800"
                        : vuln.severity === "High"
                          ? "bg-orange-100 text-orange-800"
                          : vuln.severity === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {vuln.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">System: {vuln.system}</p>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">Discovered: {vuln.discovered}</span>
                  <span
                    className={`text-xs ${
                      vuln.status === "Fixed"
                        ? "text-green-600"
                        : vuln.status === "In Progress"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {vuln.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/compliance-dashboard/run-audit"
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex flex-col items-center text-center"
          >
            <svg
              className="h-8 w-8 text-blue-600 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012 2h2a2 2 0 012-2"
              />
            </svg>
            <span className="text-sm font-medium">Run Audit</span>
          </a>

          <a
            href="/compliance-dashboard/security-assessment"
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex flex-col items-center text-center"
          >
            <svg
              className="h-8 w-8 text-blue-600 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="text-sm font-medium">Security Assessment</span>
          </a>

          <a
            href="/compliance-dashboard/hipaa-training"
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex flex-col items-center text-center"
          >
            <svg
              className="h-8 w-8 text-blue-600 mb-2"
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
            <span className="text-sm font-medium">HIPAA Training</span>
          </a>

          <a
            href="/compliance-dashboard/generate-report"
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex flex-col items-center text-center"
          >
            <svg
              className="h-8 w-8 text-blue-600 mb-2"
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
            <span className="text-sm font-medium">Generate Report</span>
          </a>
        </div>
      </div>
    </DashboardLayout>
  )
}
