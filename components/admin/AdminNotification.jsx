"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"

/**
 * AdminNotification Component
 * Displays notifications for admin users about new account registrations
 * and provides approval/denial functionality
 */
const AdminNotification = () => {
  const [pendingUsers, setPendingUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingUser, setProcessingUser] = useState(null)

  // Fetch pending users
  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        setIsLoading(true)

        const response = await fetch("/api/users/pending", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch pending users")
        }

        const data = await response.json()
        setPendingUsers(data.users || [])
      } catch (error) {
        console.error("Error fetching pending users:", error)
        toast.error("Failed to load pending users. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPendingUsers()

    // Set up polling to check for new pending users every minute
    const interval = setInterval(fetchPendingUsers, 60000)

    return () => clearInterval(interval)
  }, [])

  // Handle user approval
  const handleApprove = async (userId) => {
    try {
      setProcessingUser(userId)

      const response = await fetch(`/api/users/${userId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to approve user")
      }

      toast.success("User approved successfully. Email notification sent.")

      // Remove approved user from the list
      setPendingUsers((prev) => prev.filter((user) => user.id !== userId))
    } catch (error) {
      console.error("Error approving user:", error)
      toast.error(error.message || "Failed to approve user. Please try again.")
    } finally {
      setProcessingUser(null)
    }
  }

  // Handle user denial
  const handleDeny = async (userId, reason = "") => {
    try {
      setProcessingUser(userId)

      const response = await fetch(`/api/users/${userId}/deny`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
        credentials: "same-origin",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to deny user")
      }

      toast.success("User denied successfully. Email notification sent.")

      // Remove denied user from the list
      setPendingUsers((prev) => prev.filter((user) => user.id !== userId))
    } catch (error) {
      console.error("Error denying user:", error)
      toast.error(error.message || "Failed to deny user. Please try again.")
    } finally {
      setProcessingUser(null)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"

    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (isLoading) {
    return (
      <div className="admin-notification loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading pending user approvals...</p>
      </div>
    )
  }

  return (
    <div className="admin-notification">
      <h3>Pending User Approvals</h3>

      {pendingUsers.length === 0 ? (
        <div className="alert alert-info">No pending user approvals at this time.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) => (
                <tr key={user.id}>
                  <td>{`${user.first_name} ${user.last_name}`}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className="badge bg-secondary">{user.role}</span>
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    <div className="btn-group" role="group">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleApprove(user.id)}
                        disabled={processingUser === user.id}
                      >
                        {processingUser === user.id ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-1"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Approving...
                          </>
                        ) : (
                          "Approve"
                        )}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          const reason = prompt("Please enter a reason for denial (optional):")
                          handleDeny(user.id, reason)
                        }}
                        disabled={processingUser === user.id}
                      >
                        {processingUser === user.id ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-1"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Denying...
                          </>
                        ) : (
                          "Deny"
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminNotification
