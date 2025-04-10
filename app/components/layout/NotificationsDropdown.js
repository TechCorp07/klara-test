"use client"

// NotificationsDropdown.js
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { communication } from "../../lib/api"

export default function NotificationsDropdown({ onClose, onNotificationClick }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await communication.getNotifications()
        setNotifications(data)
        setUnreadCount(data.filter((notification) => !notification.read_at).length)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  const markAsRead = async (notificationId) => {
    try {
      await communication.markNotificationAsRead(notificationId)
      setNotifications(
        notifications.map((notification) =>
          notification.id === notificationId ? { ...notification, read_at: new Date().toISOString() } : notification,
        ),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleNotificationClick = async (notification) => {
    if (!notification.read_at) {
      await markAsRead(notification.id)
    }
    if (onNotificationClick) {
      onNotificationClick(notification)
    }
    onClose()
  }

  return (
    <div
      ref={dropdownRef}
      className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
    >
      <div className="py-1">
        <div className="px-4 py-2 text-sm text-gray-700 border-b">
          <span className="font-bold">Notifications ({unreadCount})</span>
        </div>
        {notifications.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-500">No notifications</div>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <button
              key={notification.id}
              className={`flex items-center px-4 py-3 w-full text-left ${!notification.read_at ? "bg-blue-50" : ""} hover:bg-gray-100`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                <p className="text-xs text-gray-500 truncate">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(notification.created_at).toLocaleString()}</p>
              </div>
            </button>
          ))
        )}
        {notifications.length > 5 && (
          <Link href="/notifications" className="block px-4 py-2 text-center text-sm text-blue-600 hover:bg-gray-100">
            View all notifications
          </Link>
        )}
      </div>
    </div>
  )
}
