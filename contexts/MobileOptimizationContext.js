"use client"

import React, { useState, useEffect } from "react"

/**
 * MobileOptimizationProvider Component
 * Provides mobile optimization context and functionality to the application
 */
const MobileOptimizationContext = React.createContext({
  isMobile: false,
  isTablet: false,
  isDesktop: false,
  touchEnabled: false,
  optimizationEnabled: true,
  toggleOptimization: () => {},
  connectionStatus: "online",
  deviceOrientation: "portrait",
})

export const MobileOptimizationProvider = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const [touchEnabled, setTouchEnabled] = useState(false)
  const [optimizationEnabled, setOptimizationEnabled] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState("online")
  const [deviceOrientation, setDeviceOrientation] = useState("portrait")

  // Detect device type and capabilities on mount
  useEffect(() => {
    const detectDeviceType = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
      setIsDesktop(width >= 1024)

      // Check if device has touch capability
      setTouchEnabled("ontouchstart" in window || navigator.maxTouchPoints > 0)

      // Check device orientation
      const orientation = window.innerHeight > window.innerWidth ? "portrait" : "landscape"
      setDeviceOrientation(orientation)
    }

    // Detect connection status
    const handleConnectionChange = () => {
      setConnectionStatus(navigator.onLine ? "online" : "offline")
    }

    // Initial detection
    detectDeviceType()
    handleConnectionChange()

    // Set up event listeners
    window.addEventListener("resize", detectDeviceType)
    window.addEventListener("orientationchange", detectDeviceType)
    window.addEventListener("online", handleConnectionChange)
    window.addEventListener("offline", handleConnectionChange)

    // Apply mobile optimization class to body if enabled
    if (optimizationEnabled) {
      document.body.classList.add("mobile-optimized")
    }

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener("resize", detectDeviceType)
      window.removeEventListener("orientationchange", detectDeviceType)
      window.removeEventListener("online", handleConnectionChange)
      window.removeEventListener("offline", handleConnectionChange)
    }
  }, [optimizationEnabled])

  // Toggle mobile optimization
  const toggleOptimization = () => {
    setOptimizationEnabled((prev) => {
      const newValue = !prev
      if (newValue) {
        document.body.classList.add("mobile-optimized")
      } else {
        document.body.classList.remove("mobile-optimized")
      }
      return newValue
    })
  }

  const contextValue = {
    isMobile,
    isTablet,
    isDesktop,
    touchEnabled,
    optimizationEnabled,
    toggleOptimization,
    connectionStatus,
    deviceOrientation,
  }

  return (
    <MobileOptimizationContext.Provider value={contextValue}>
      {connectionStatus === "offline" && optimizationEnabled && (
        <div className="offline-indicator">You are currently offline. Some features may be unavailable.</div>
      )}
      {children}
    </MobileOptimizationContext.Provider>
  )
}

// Custom hook to use the mobile optimization context
export const useMobileOptimization = () => {
  const context = React.useContext(MobileOptimizationContext)
  if (context === undefined) {
    throw new Error("useMobileOptimization must be used within a MobileOptimizationProvider")
  }
  return context
}

export default MobileOptimizationContext
