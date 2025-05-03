"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "react-toastify"

/**
 * Client component for notifications page
 */
export default function NotificationsClient() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeTab, setActiveTab] = useState("all")
  const [isConnected, setIsConnected] = useState(false)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        // This would be replaced with actual API call
        setTimeout(() => {
          const mockNotifications = [
            {
              id: 1,
              type: "appointment",
              title: "Appointment Reminder",
              message: "You have an appointment with Dr. Sarah Smith tomorrow at 2:30 PM.",
              created_at: "2023-04-14T14:30:00Z",
              is_read: false,
              action_url: "/telemedicine",
              priority: "high",
            },
            {
              id: 2,
              type: "medication",
              title: "Medication Refill",
              message: "Your prescription for Lisinopril is due for refill in 3 days.",
              created_at: "2023-04-13T10:15:00Z",
              is_read: false,
              action_url: "/medical-records",
              priority: "medium",
            },
            {
              id: 3,
              type: "lab_result",
              title: "Lab Results Available",
              message: "Your recent blood work results are now available for review.",
              created_at: "2023-04-12T16:45:00Z",
              is_read: true,
              action_url: "/medical-records",
              priority: "medium",
            },
            {
              id: 4,
              type: "system",
              title: "Profile Update Required",
              message: "Please update your contact information to ensure you receive important updates.",
              created_at: "2023-04-10T09:30:00Z",
              is_read: true,
              action_url: "/profile",
              priority: "low",
            },
            {
              id: 5,
              type: "community",
              title: "New Response to Your Post",
              message: "Dr. Johnson has responded to your question about hypertension management.",
              created_at: "2023-04-09T13:20:00Z",
              is_read: true,
              action_url: "/community",
              priority: "low",
            },
          ]

          setNotifications(mockNotifications)
          setUnreadCount(mockNotifications.filter((n) => !n.is_read).length)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching notifications:", error)
        toast.error("Failed to load notifications")
        setLoading(false)
      }
    }

    // Initialize WebSocket connection
    const initializeWebSocket = () => {
      // This would be replaced with actual WebSocket connection
      // const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL);

      // Mock WebSocket behavior
      const mockSocket = {
        onopen: null,
        onmessage: null,
        onclose: null,
        onerror: null,
        send: (data) => {
          console.log("WebSocket message sent:", data)
        },
        close: () => {
          console.log("WebSocket connection closed")
          setIsConnected(false)
        },
      }

      setSocket(mockSocket)

      // Simulate WebSocket connection established
      setTimeout(() => {
        setIsConnected(true)
        if (mockSocket.onopen) mockSocket.onopen()
      }, 1000)

      // Simulate receiving a new notification after 5 seconds
      setTimeout(() => {
        if (mockSocket.onmessage) {
          const newNotification = {
            id: 6,
            type: "appointment",
            title: "Appointment Confirmed",
            message: "Your appointment with Dr. Chen has been confirmed for next Monday at 10:00 AM.",
            created_at: new Date().toISOString(),
            is_read: false,
            action_url: "/telemedicine",
            priority: "high",
          }

          mockSocket.onmessage({
            data: JSON.stringify({
              type: "notification",
              data: newNotification,
            }),
          })

          // Update notifications and unread count
          setNotifications((prev) => [newNotification, ...prev])
          setUnreadCount((prev) => prev + 1)

          // Show toast notification
          toast.info("New notification: Appointment Confirmed")
        }
      }, 5000)

      return mockSocket
    }

    if (user) {
      fetchNotifications()
      const ws = initializeWebSocket()

      // Cleanup WebSocket connection on component unmount
      return () => {
        if (ws) ws.close()
      }
    }
  }, [user])

  useEffect(() => {
    // Set up WebSocket message handler
    if (socket) {
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === "notification") {
            // Add new notification to the list
            setNotifications((prev) => [data.data, ...prev])
            setUnreadCount((prev) => prev + 1)

            // Show toast notification
            toast.info(`New notification: ${data.data.title}`)
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error)
        }
      }

      socket.onclose = () => {
        setIsConnected(false)

        // Attempt to reconnect after a delay
        setTimeout(() => {
          // This would be replaced with actual WebSocket reconnection
          setIsConnected(true)
        }, 3000)
      }

      socket.onerror = (error) => {
        console.error("WebSocket error:", error)
        setIsConnected(false)
      }
    }
  }, [socket])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      // This would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update notification status
      setNotifications(
        notifications.map((notification) => {
          if (notification.id === notificationId && !notification.is_read) {
            setUnreadCount((prev) => prev - 1)
            return { ...notification, is_read: true }
          }
          return notification
        }),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast.error("Failed to update notification")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      // This would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update all notifications to read
      setNotifications(
        notifications.map((notification) => {
          return { ...notification, is_read: true }
        }),
      )

      setUnreadCount(0)
      toast.success("All notifications marked as read")
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast.error("Failed to update notifications")
    }
  }

  const handleDeleteNotification = async (notificationId) => {
    try {
      // This would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Remove notification from list
      const updatedNotifications = notifications.filter((notification) => notification.id !== notificationId)
      setNotifications(updatedNotifications)

      // Update unread count if needed
      const deletedNotification = notifications.find((notification) => notification.id === notificationId)
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount((prev) => prev - 1)
      }

      toast.success("Notification deleted")
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast.error("Failed to delete notification")
    }
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

    return new Date(dateString).toLocaleDateString()
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "appointment":
        return (
          <svg
            className="h-6 w-6 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        )
      case "medication":
        return (
          <svg
            className="h-6 w-6 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        )
      case "lab_result":
        return (
          <svg
            className="h-6 w-6 text-purple-500"
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
      case "system":
        return (
          <svg
            className="h-6 w-6 text-gray-500"
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
      case "community":
        return (
          <svg
            className="h-6 w-6 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
            />
          </svg>
        )
      default:
        return (
          <svg
            className="h-6 w-6 text-primary-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        )
    }
  }

  const filteredNotifications = () => {
    if (activeTab === "all") {
      return notifications
    } else if (activeTab === "unread") {
      return notifications.filter((notification) => !notification.is_read)
    } else {
      return notifications.filter((notification) => notification.type === activeTab)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <>
          {/* Connection Status */}
          <div
            className={`mb-4 px-4 py-2 rounded-md flex items-center ${isConnected ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
          >
            <div className={`h-3 w-3 rounded-full mr-2 ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
            <span className="text-sm font-medium">
              {isConnected ? "Real-time notifications active" : "Connecting to notification service..."}
            </span>
          </div>

          {/* Tabs and Actions */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex flex-wrap items-center justify-between">
              <div className="flex space-x-4 overflow-x-auto pb-2 sm:pb-0">
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === "all" ? "bg-primary-100 text-primary-700" : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabChange("all")}
                >
                  All
                </button>
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === "unread" ? "bg-primary-100 text-primary-700" : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabChange("unread")}
                >
                  Unread{" "}
                  {unreadCount > 0 && (
                    <span className="ml-1 bg-primary-500 text-white px-2 py-0.5 rounded-full text-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === "appointment"
                      ? "bg-primary-100 text-primary-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabChange("appointment")}
                >
                  Appointments
                </button>
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === "medication" ? "bg-primary-100 text-primary-700" : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabChange("medication")}
                >
                  Medications
                </button>
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === "lab_result" ? "bg-primary-100 text-primary-700" : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabChange("lab_result")}
                >
                  Lab Results
                </button>
              </div>

              <div className="mt-2 sm:mt-0">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark All as Read
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div>
              {filteredNotifications().length === 0 ? (
                <div className="px-4 py-5 sm:p-6 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {activeTab === "unread"
                      ? "You have no unread notifications."
                      : activeTab === "all"
                        ? "You don't have any notifications yet."
                        : `You don't have any ${activeTab.replace("_", " ")} notifications.`}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredNotifications().map((notification) => (
                    <li
                      key={notification.id}
                      className={`px-4 py-4 sm:px-6 ${!notification.is_read ? "bg-primary-50" : ""}`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">{getNotificationIcon(notification.type)}</div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                              {!notification.is_read && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                  New
                                </span>
                              )}
                            </p>
                            <div className="flex-shrink-0 flex">
                              <p className="text-sm text-gray-500">{getRelativeTime(notification.created_at)}</p>
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                          <div className="mt-2 flex justify-between">
                            <div className="flex">
                              <a
                                href={notification.action_url}
                                className="text-sm font-medium text-primary-600 hover:text-primary-500"
                              >
                                View Details
                              </a>
                              {!notification.is_read && (
                                <button
                                  type="button"
                                  className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  Mark as Read
                                </button>
                              )}
                            </div>
                            <button
                              type="button"
                              className="text-sm font-medium text-gray-500 hover:text-gray-700"
                              onClick={() => handleDeleteNotification(notification.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Notification Settings</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Customize how and when you receive notifications.</p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-medium text-gray-900">Notification Channels</h4>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="email-notifications"
                          name="email-notifications"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="email-notifications" className="ml-3 block text-sm font-medium text-gray-700">
                          Email Notifications
                        </label>
                      </div>
                      <span className="text-sm text-gray-500">Receive important notifications via email</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="sms-notifications"
                          name="sms-notifications"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="sms-notifications" className="ml-3 block text-sm font-medium text-gray-700">
                          SMS Notifications
                        </label>
                      </div>
                      <span className="text-sm text-gray-500">Receive urgent notifications via text message</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="push-notifications"
                          name="push-notifications"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="push-notifications" className="ml-3 block text-sm font-medium text-gray-700">
                          Push Notifications
                        </label>
                      </div>
                      <span className="text-sm text-gray-500">Receive real-time notifications in your browser</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-medium text-gray-900">Notification Types</h4>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="appointment-notifications"
                          name="appointment-notifications"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label
                          htmlFor="appointment-notifications"
                          className="ml-3 block text-sm font-medium text-gray-700"
                        >
                          Appointment Reminders
                        </label>
                      </div>
                      <span className="text-sm text-gray-500">24 hours before scheduled appointments</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="medication-notifications"
                          name="medication-notifications"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label
                          htmlFor="medication-notifications"
                          className="ml-3 block text-sm font-medium text-gray-700"
                        >
                          Medication Reminders
                        </label>
                      </div>
                      <span className="text-sm text-gray-500">Refill reminders and medication schedules</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="lab-notifications"
                          name="lab-notifications"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label htmlFor="lab-notifications" className="ml-3 block text-sm font-medium text-gray-700">
                          Lab Results
                        </label>
                      </div>
                      <span className="text-sm text-gray-500">When new lab results are available</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="community-notifications"
                          name="community-notifications"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          defaultChecked
                        />
                        <label
                          htmlFor="community-notifications"
                          className="ml-3 block text-sm font-medium text-gray-700"
                        >
                          Community Activity
                        </label>
                      </div>
                      <span className="text-sm text-gray-500">Responses to your posts and group activity</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => toast.success("Notification settings saved")}
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
