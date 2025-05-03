"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { resetSessionStartTime } from "@/lib/session"
import { SESSION_TIMEOUT_MINUTES } from "@/lib/config"

/**
 * Component to handle session timeout
 * Shows a warning when the session is about to expire
 * Logs out the user when the session expires
 */
export default function SessionTimeout() {
  const { isAuthenticated, logout } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  // Check session timeout
  const checkSessionTimeout = useCallback(() => {
    if (!isAuthenticated) return

    // Calculate time left before timeout
    const startTime = Number.parseInt(sessionStorage.getItem("sessionStartTime") || "0", 10)
    const currentTime = Date.now()
    const sessionTimeoutMs = SESSION_TIMEOUT_MINUTES * 60 * 1000
    const warningTimeMs = 2 * 60 * 1000 // 2 minutes before timeout
    const elapsedTime = currentTime - startTime
    const remainingTime = sessionTimeoutMs - elapsedTime

    // If session has timed out, log out
    if (remainingTime <= 0) {
      logout()
      return
    }

    // If session is about to time out, show warning
    if (remainingTime <= warningTimeMs) {
      setShowWarning(true)
      setTimeLeft(Math.floor(remainingTime / 1000))
    } else {
      setShowWarning(false)
    }
  }, [isAuthenticated, logout])

  // Reset session timeout
  const resetTimeout = useCallback(() => {
    resetSessionStartTime()
    setShowWarning(false)
  }, [])

  // Check session timeout on mount and set up interval
  useEffect(() => {
    if (!isAuthenticated) return

    // Check immediately
    checkSessionTimeout()

    // Set up interval to check every minute
    const interval = setInterval(checkSessionTimeout, 60000)

    // Set up event listeners to reset timeout on user activity
    const resetOnActivity = () => {
      if (isAuthenticated) {
        resetTimeout()
      }
    }

    window.addEventListener("mousemove", resetOnActivity)
    window.addEventListener("keydown", resetOnActivity)
    window.addEventListener("click", resetOnActivity)
    window.addEventListener("touchstart", resetOnActivity)

    return () => {
      clearInterval(interval)
      window.removeEventListener("mousemove", resetOnActivity)
      window.removeEventListener("keydown", resetOnActivity)
      window.removeEventListener("click", resetOnActivity)
      window.removeEventListener("touchstart", resetOnActivity)
    }
  }, [isAuthenticated, checkSessionTimeout, resetTimeout])

  // Don't render anything if not authenticated or no warning
  if (!isAuthenticated || !showWarning) {
    return null
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Session Timeout Warning</h2>
        <p className="mb-4">
          Your session will expire in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")} minutes
          due to inactivity.
        </p>
        <div className="flex justify-end space-x-4">
          <button onClick={logout} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
            Logout
          </button>
          <button onClick={resetTimeout} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Continue Session
          </button>
        </div>
      </div>
    </div>
  )
}
