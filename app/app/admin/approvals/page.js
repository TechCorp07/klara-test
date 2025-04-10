"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { healthcare } from "@/lib/services/healthcareService"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { toast } from "react-toastify"

export default function AdminApprovals() {
  const { user } = useAuth()
  const [approvalType, setApprovalType] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  // Fetch pending approvals with filters
  const {
    data: approvals,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["pendingApprovals", approvalType, priorityFilter],
    queryFn: () =>
      healthcare.getPendingApprovals({
        type: approvalType !== "all" ? approvalType : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
      }),
    enabled: !!user && (user.role === "admin" || user.role === "superadmin"),
    onError: (error) => {
      toast.error("Failed to load pending approvals")
      console.error("Error fetching approvals:", error)
    },
  })

  // Redirect if user is not an admin or superadmin
  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "superadmin") {
      window.location.href = "/dashboard"
    }
  }, [user])

  const handleApprovalTypeChange = (e) => {
    setApprovalType(e.target.value)
  }

  const handlePriorityFilterChange = (e) => {
    setPriorityFilter(e.target.value)
  }

  const handleApprove = (approvalId) => {
    // Implementation would call API to approve
    toast.success("Item approved successfully")
  }

  const handleReject = (approvalId) => {
    // Implementation would call API to reject
    toast.success("Item rejected successfully")
  }

  const handleRequestInfo = (approvalId) => {
    // Implementation would call API to request more information
    toast.success("Additional information requested")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Pending Approvals</h1>
        <p className="text-gray-600">Review and manage pending approval requests</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
          <div>
            <label htmlFor="approvalType" className="block text-sm font-medium text-gray-700 mb-1">
              Approval Type
            </label>
            <select
              id="approvalType"
              value={approvalType}
              onChange={handleApprovalTypeChange}
              className="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Types</option>
              <option value="user">User Registration</option>
              <option value="provider">Provider Verification</option>
              <option value="research">Research Study</option>
              <option value="data_access">Data Access</option>
              <option value="medication">Medication Change</option>
            </select>
          </div>

          <div>
            <label htmlFor="priorityFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="priorityFilter"
              value={priorityFilter}
              onChange={handlePriorityFilterChange}
              className="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex-1 md:text-right">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Approvals List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-500">Error loading approvals. Please try again.</p>
          </div>
        ) : approvals && approvals.results && approvals.results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Requested By
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
                    Priority
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {approvals.results.map((approval) => (
                  <tr key={approval.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          approval.type === "user"
                            ? "bg-blue-100 text-blue-800"
                            : approval.type === "provider"
                              ? "bg-green-100 text-green-800"
                              : approval.type === "research"
                                ? "bg-purple-100 text-purple-800"
                                : approval.type === "data_access"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {approval.type
                          .split("_")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{approval.requested_by}</div>
                      <div className="text-sm text-gray-500">{approval.requester_role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(approval.requested_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          approval.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : approval.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {approval.priority.charAt(0).toUpperCase() + approval.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{approval.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{approval.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link href={`/admin/approvals/${approval.id}`} className="text-blue-600 hover:text-blue-900">
                          View
                        </Link>
                        <button
                          onClick={() => handleApprove(approval.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button onClick={() => handleReject(approval.id)} className="text-red-600 hover:text-red-900">
                          Reject
                        </button>
                        <button
                          onClick={() => handleRequestInfo(approval.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Request Info
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">No pending approvals found matching your criteria.</p>
          </div>
        )}

        {/* Pagination */}
        {approvals && approvals.total_pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{approvals.results.length > 0 ? 1 : 0}</span> to{" "}
                  <span className="font-medium">{approvals.results.length}</span> of{" "}
                  <span className="font-medium">{approvals.total_count}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {/* Page numbers would be dynamically generated here */}
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
