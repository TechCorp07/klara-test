"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { audit } from "@/lib/services/auditService"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "react-toastify"

export default function AuditLogPage() {
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()
  const [filters, setFilters] = useState({
    eventType: "",
    resourceType: "",
    startDate: "",
    endDate: "",
    userId: "",
  })

  // Initialize queryClient
  const queryClient = useQueryClient()

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch audit events only after component is mounted
  const {
    data: auditEvents = { results: [], count: 0 },
    isLoading,
    error,
  } = useQuery({
    queryKey: ["auditEvents", filters],
    queryFn: () => audit.getEvents(filters),
    enabled: mounted && !!user && (user?.role === "admin" || user?.role === "compliance"),
    onError: (error) => {
      if (mounted) {
        toast.error("Failed to load audit events")
        console.error("Error fetching audit events:", error)
      }
    },
  })

  // Mutation for exporting audit events
  const exportEventsMutation = useMutation({
    mutationFn: (options) => audit.exportEvents(options),
    onSuccess: (data) => {
      if (mounted) {
        toast.success("Export initiated. You will be notified when it is ready for download.")
      }
    },
    onError: (error) => {
      if (mounted) {
        toast.error("Failed to export audit events")
        console.error("Error exporting events:", error)
      }
    },
  })

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleExport = () => {
    exportEventsMutation.mutate(filters)
  }

  // Handle server-side rendering gracefully
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Audit Log</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  // Check if user has permission to view this page
  if (user && user.role !== "admin" && user.role !== "compliance") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Audit Log</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Audit Log</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading audit events. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Audit Log</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              id="eventType"
              name="eventType"
              value={filters.eventType}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Event Types</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="view">View</option>
              <option value="export">Export</option>
            </select>
          </div>

          <div>
            <label htmlFor="resourceType" className="block text-sm font-medium text-gray-700 mb-1">
              Resource Type
            </label>
            <select
              id="resourceType"
              name="resourceType"
              value={filters.resourceType}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Resource Types</option>
              <option value="user">User</option>
              <option value="medical_record">Medical Record</option>
              <option value="appointment">Appointment</option>
              <option value="medication">Medication</option>
              <option value="message">Message</option>
              <option value="condition">Condition</option>
            </select>
          </div>

          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={filters.userId}
              onChange={handleFilterChange}
              placeholder="Enter user ID"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
            onClick={() => queryClient.invalidateQueries(["auditEvents", filters])}
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Audit Events Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Audit Events</h2>

          <button
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
            onClick={handleExport}
            disabled={exportEventsMutation.isPending}
          >
            {exportEventsMutation.isPending ? "Exporting..." : "Export to CSV"}
          </button>
        </div>

        {auditEvents?.results && auditEvents.results.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Timestamp
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Event Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Resource Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Resource ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditEvents.results.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {event.user_email || event.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          event.event_type === "login" || event.event_type === "logout"
                            ? "bg-blue-100 text-blue-800"
                            : event.event_type === "create"
                              ? "bg-green-100 text-green-800"
                              : event.event_type === "update"
                                ? "bg-yellow-100 text-yellow-800"
                                : event.event_type === "delete"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.resource_type.charAt(0).toUpperCase() + event.resource_type.slice(1).replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.resource_id || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {auditEvents.count > auditEvents.results.length && (
              <div className="py-3 flex items-center justify-between border-t border-gray-200">
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
                      Showing <span className="font-medium">1</span> to{" "}
                      <span className="font-medium">{auditEvents.results.length}</span> of{" "}
                      <span className="font-medium">{auditEvents.count}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        Previous
                      </button>
                      <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No audit events found matching the current filters.</p>
        )}
      </div>
    </div>
  )
}
