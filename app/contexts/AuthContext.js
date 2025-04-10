"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { auth } from "../lib/services/authService"
import { isAuthenticated, initIdleTimer, logout } from "../lib/auth"
import { useQuery } from "@tanstack/react-query"

// Create context
export const AuthContext = createContext()

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [twoFactorUserId, setTwoFactorUserId] = useState(null)
  const router = useRouter()

  // Use React Query to fetch current user
  const {
    data: currentUser,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => auth.getCurrentUser(),
    enabled: isAuthenticated(),
    retry: false,
    onSuccess: (data) => {
      setUser(data)
    },
    onError: () => {
      // If error fetching user, log out
      logout()
      setUser(null)
    },
  })

  // Set loading state based on user query
  useEffect(() => {
    if (!isAuthenticated()) {
      setLoading(false)
    } else {
      setLoading(isUserLoading)
    }
  }, [isUserLoading])

  // Set up idle timer for session management
  useEffect(() => {
    const cleanup = initIdleTimer()
    return cleanup
  }, [])

  // Login function
  const login = async (credentials) => {
    try {
      const response = await auth.login(credentials)

      if (response.requires2FA) {
        // 2FA required
        setRequiresTwoFactor(true)
        setTwoFactorUserId(response.user_id)
        return { requires2FA: true }
      } else {
        // Standard login - cookies are set by the API route
        setUser(response.user)
        setRequiresTwoFactor(false)
        setTwoFactorUserId(null)
        return { success: true, user: response.user }
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  // 2FA verification
  const verify2FA = async (token) => {
    try {
      const response = await auth.verify2FA(twoFactorUserId, token)
      setUser(response.user)
      setRequiresTwoFactor(false)
      setTwoFactorUserId(null)
      return { success: true, user: response.user }
    } catch (error) {
      console.error("2FA verification error:", error)
      throw error
    }
  }

  // Registration function
  const register = async (userData) => {
    try {
      const response = await auth.register(userData)
      return { success: true, user: response }
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  // Logout function
  const handleLogout = async () => {
    try {
      await auth.logout()
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      // Force logout even if API call fails
      logout()
      setUser(null)
      router.push("/login")
    }
  }

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const updatedUser = await auth.updateProfile(userData)
      setUser(updatedUser)
      toast.success("Profile updated successfully")
      return updatedUser
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  }

  // Setup 2FA
  const setupTwoFactor = async () => {
    try {
      return await auth.setup2FA()
    } catch (error) {
      console.error("Setup 2FA error:", error)
      throw error
    }
  }

  // Confirm 2FA setup
  const confirmTwoFactor = async (token) => {
    try {
      const response = await auth.confirm2FA(token)

      // Update user with 2FA enabled
      setUser({ ...user, two_factor_enabled: true })
      toast.success("Two-factor authentication enabled")
      return response
    } catch (error) {
      console.error("Confirm 2FA error:", error)
      throw error
    }
  }

  // Disable 2FA
  const disableTwoFactor = async (password) => {
    try {
      await auth.disable2FA(password)

      // Update user with 2FA disabled
      setUser({ ...user, two_factor_enabled: false })
      toast.success("Two-factor authentication disabled")
      return true
    } catch (error) {
      console.error("Disable 2FA error:", error)
      throw error
    }
  }

  // Update consent
  const updateConsent = async (consentType, consented) => {
    try {
      await auth.updateConsent(consentType, consented)

      // Update user with new consent setting
      const updatedUser = { ...user }

      switch (consentType) {
        case "DATA_SHARING":
          updatedUser.data_sharing_consent = consented
          break
        case "MEDICATION_ADHERENCE":
          updatedUser.medication_adherence_monitoring_consent = consented
          break
        case "VITALS_MONITORING":
          updatedUser.vitals_monitoring_consent = consented
          break
        case "RESEARCH":
          updatedUser.research_consent = consented
          break
      }

      setUser(updatedUser)
      toast.success("Consent settings updated")
      return true
    } catch (error) {
      console.error("Update consent error:", error)
      throw error
    }
  }

  // Context value
  const value = {
    user,
    loading,
    requiresTwoFactor,
    twoFactorUserId,
    isAuthenticated: !!user,
    login,
    verify2FA,
    register,
    logout: handleLogout,
    updateProfile,
    setup2FA: setupTwoFactor,
    confirm2FA: confirmTwoFactor,
    disable2FA: disableTwoFactor,
    updateConsent,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
