"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { toast } from "react-toastify"
import { useAuth } from "./AuthContext"
import { getWebsocketUrl } from "@/lib/env"

// Create context
const NotificationContext = createContext({})

/**
 * Notification provider component
 */
export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [socket, setSocket] = useState(null)

  // Connect to WebSocket when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      return
    }

    const websocketUrl = getWebsocketUrl()
    const ws = new WebSocket(`${websocketUrl}/ws/notifications/${user.id}/`)

    ws.onopen = () => {
      console.log("WebSocket connected")
      setSocket(ws)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === "notification") {
          // Add new notification to state
          setNotifications((prev) => [data.notification, ...prev])
          setUnreadCount((prev) => prev + 1)

          // Show toast for new notification
          toast.info(data.notification.message, {
            onClick: () => markAsRead(data.notification.id),
          })
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }

    ws.onerror = (error) => {
      console.error("WebSocket error:", error)
    }

    ws.onclose = () => {
      console.log("WebSocket disconnected")
      setSocket(null)
    }

    // Cleanup on unmount
    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [isAuthenticated, user])

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      return
    }

    try {
      const response = await fetch("/api/notifications")
      const data = await response.json()

      setNotifications(data.notifications)
      setUnreadCount(data.notifications.filter((n) => !n.is_read).length)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }, [isAuthenticated])

  /**
   * Mark notification as read
   * @param {number} id - Notification ID
   */
  const markAsRead = useCallback(async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
      })

      // Update local state
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))

      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }, [])

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await fetch("/api/notifications/read-all", {
        method: "POST",
      })

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))

      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }, [])

  // Load notifications on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications()
    }
  }, [isAuthenticated, fetchNotifications])

  // Context value
  const value = {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

/**
 * Hook to use the notification context
 */
export const useNotifications = () => useContext(NotificationContext)

export default NotificationContext
