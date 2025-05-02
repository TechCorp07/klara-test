"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "react-toastify"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import HIPAABanner from "@/components/ui/HIPAABanner"

// SVG icons for quick actions
const UserIcon = () => (
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
)

const BackupIcon = () => (
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
)

const ReportIcon = () => (
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
)

const SettingsIcon = () => (
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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

/**
 * Enhanced dashboard component with admin functionality
 * - System statistics overview
 * - User management
 * - Pending approvals
 * - Audit logs
 * - System settings
 * - HIPAA compliance tracking
 */
export default function DashboardClient() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [pendingUsers, setPendingUsers] = useState([])
  const [activeUsers, setActiveUsers] = useState([])
  const [systemStats, setSystemStats] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const [activeTab, setActiveTab] = useState("users")
  const [searchQuery, setSearchQuery] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Fetch admin dashboard data
    const fetchAdminData = async () => {
      try {
        // This would be replaced with actual API calls
        setTimeout(() => {
          setPendingUsers([
            {
              id: 101,
              name: "John Smith",
              email: "john.smith@example.com",
              role: "patient",
              registration_date: "2023-04-10T14:30:00Z",
              status: "pending",
            },
            {
              id: 102,
              name: "Emily Johnson",
              email: "emily.johnson@example.com",
              role: "provider",
              registration_date: "2023-04-11T09:15:00Z",
              status: "pending",
            },
            {
              id: 103,
              name: "Michael Brown",
              email: "michael.brown@example.com",
              role: "pharmco",
              registration_date: "2023-04-12T16:45:00Z",
              status: "pending",
            },
          ])

          setActiveUsers([
            {
              id: 1,
              name: "Dr. Sarah Smith",
              email: "sarah.smith@example.com",
              role: "provider",
              registration_date: "2023-01-15T10:00:00Z",
              last_login: "2023-04-14T08:30:00Z",
              status: "active",
            },
            {
              id: 2,
              name: "Robert Williams",
              email: "robert.williams@example.com",
              role: "patient",
              registration_date: "2023-02-20T14:30:00Z",
              last_login: "2023-04-13T11:45:00Z",
              status: "active",
            },
            {
              id: 3,
              name: "Lisa Chen",
              email: "lisa.chen@example.com",
              role: "provider",
              registration_date: "2023-01-10T09:15:00Z",
              last_login: "2023-04-15T09:30:00Z",
              status: "active",
            },
            {
              id: 4,
              name: "James Johnson",
              email: "james.johnson@example.com",
              role: "patient",
              registration_date: "2023-03-05T11:30:00Z",
              last_login: "2023-04-12T15:20:00Z",
              status: "active",
            },
            {
              id: 5,
              name: "Maria Garcia",
              email: "maria.garcia@example.com",
              role: "pharmco",
              registration_date: "2023-02-15T13:45:00Z",
              last_login: "2023-04-14T10:15:00Z",
              status: "active",
            },
          ])

          setSystemStats({
            total_users: 156,
            active_users_today: 42,
            new_registrations_week: 15,
            pending_approvals: 3,
            total_appointments: 287,
            upcoming_appointments: 53,
            total_telemedicine_sessions: 124,
            active_community_discussions: 38,
            system_uptime: "99.98%",
            api_response_time: "245ms",
            database_size: "1.2 GB",
            storage_usage: "68%",
          })

          setAuditLogs([
            {
              id: 1001,
              user: {
                id: 1,
                name: "Dr. Sarah Smith",
                email: "sarah.smith@example.com",
              },
              action: "patient_record_access",
              resource: "Patient #2 Medical Records",
              timestamp: "2023-04-15T09:45:00Z",
              ip_address: "192.168.1.105",
              details: "Accessed patient medical history and lab results",
            },
            {
              id: 1002,
              user: {
                id: 5,
                name: "Maria Garcia",
                email: "maria.garcia@example.com",
              },
              action: "medication_update",
              resource: "Medication Database",
              timestamp: "2023-04-14T14:30:00Z",
              ip_address: "192.168.1.110",
              details: "Updated medication information for Lisinopril",
            },
            {
              id: 1003,
              user: {
                id: 10,
                name: "Admin User",
                email: "admin@klararety.com",
              },
              action: "user_approval",
              resource: "User Management",
              timestamp: "2023-04-14T11:20:00Z",
              ip_address: "192.168.1.100",
              details: "Approved new provider account for Dr. Emily Johnson",
            },
            {
              id: 1004,
              user: {
                id: 3,
                name: "Lisa Chen",
                email: "lisa.chen@example.com",
              },
              action: "appointment_creation",
              resource: "Appointment System",
              timestamp: "2023-04-13T15:10:00Z",
              ip_address: "192.168.1.108",
              details: "Created new appointment with Patient #4",
            },
            {
              id: 1005,
              user: {
                id: 10,
                name: "Admin User",
                email: "admin@klararety.com",
              },
              action: "system_configuration",
              resource: "System Settings",
              timestamp: "2023-04-12T10:05:00Z",
              ip_address: "192.168.1.100",
              details: "Updated email notification settings",
            },
          ])

          setIsLoading(false)
        }, 1500)
      } catch (error) {
        console.error("Error fetching admin data:", error)
        toast.error("Failed to load admin dashboard data")
        setIsLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleApproveUser = async (userId) => {
    setIsProcessing(true)
    try {
      // This would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update user status
      const approvedUser = pendingUsers.find((user) => user.id === userId)
      setPendingUsers(pendingUsers.filter((user) => user.id !== userId))

      // Add to active users
      approvedUser.status = "active"
      approvedUser.last_login = null
      setActiveUsers([...activeUsers, approvedUser])

      // Update system stats
      setSystemStats({
        ...systemStats,
        pending_approvals: systemStats.pending_approvals - 1,
        total_users: systemStats.total_users + 1,
      })

      toast.success(`User ${approvedUser.name} approved successfully`)
    } catch (error) {
      console.error("Error approving user:", error)
      toast.error("Failed to approve user")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectUser = async (userId) => {
    setIsProcessing(true)
    try {
      // This would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Remove user from pending list
      const rejectedUser = pendingUsers.find((user) => user.id === userId)
      setPendingUsers(pendingUsers.filter((user) => user.id !== userId))

      // Update system stats
      setSystemStats({
        ...systemStats,
        pending_approvals: systemStats.pending_approvals - 1,
      })

      toast.success(`User ${rejectedUser.name} rejected`)
    } catch (error) {
      console.error("Error rejecting user:", error)
      toast.error("Failed to reject user")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeactivateUser = async (userId) => {
    setIsProcessing(true)
    try {
      // This would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update user status
      setActiveUsers(
        activeUsers.map((user) => {
          if (user.id === userId) {
            return { ...user, status: "inactive" }
          }
          return user
        }),
      )

      toast.success("User deactivated successfully")
    } catch (error) {
      console.error("Error deactivating user:", error)
      toast.error("Failed to deactivate user")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReactivateUser = async (userId) => {
    setIsProcessing(true)
    try {
      // This would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update user status
      setActiveUsers(
        activeUsers.map((user) => {
          if (user.id === userId) {
            return { ...user, status: "active" }
          }
          return user
        }),
      )

      toast.success("User reactivated successfully")
    } catch (error) {
      console.error("Error reactivating user:", error)
      toast.error("Failed to reactivate user")
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getRelativeTime = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) {
      return "just now"
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
    }

    return formatDate(dateString)
  }

  const filteredActiveUsers = searchQuery
    ? activeUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.role.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : activeUsers

  const filteredAuditLogs = searchQuery
    ? auditLogs.filter(
        (log) =>
          log.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.details.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : auditLogs

  if (isLoading) {
    return (
      <DashboardLayout
        title="Admin Dashboard"
        subtitle="Manage users, monitor system performance, and view audit logs"
        role={user?.role || "admin"}
      >
        <div className="flex items-center justify-center h-64">
          <svg
            className="animate-spin h-8 w-8 text-primary-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="ml-2 text-gray-600">Loading admin dashboard...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="Manage users, monitor system performance, and view audit logs"
      role={user?.role || "admin"}
    >
      {/* HIPAA Banner - Integrated from AdminClient.jsx */}
      <HIPAABanner />

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search users, audit logs, or actions..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Rest of the component... */}
      {/* System Stats, Quick Actions, Tabs, etc. */}
    </DashboardLayout>
  )
}
