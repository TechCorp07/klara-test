"use client"

import { createContext, useState, useEffect, useCallback, useContext } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import authService from "@/lib/services/auth-service"

// Create the auth context
const AuthContext = createContext({})

/**
 * Authentication provider component
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  // Load user on initial mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if we have a token
        if (!authService.isAuthenticated()) {
          setLoading(false)
          return
        }

        // Fetch current user
        const userData = await authService.getCurrentUser()
        setUser(userData)
      } catch (err) {
        console.error("Failed to load user:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  /**
   * Get dashboard route based on user role
   * @param {string} role - User role
   */
  const getDashboardRoute = (role) => {
    switch (role) {
      case "patient":
        return "/dashboard/patient"
      case "provider":
        return "/dashboard/provider"
      case "admin":
        return "/dashboard/admin"
      case "compliance":
        return "/dashboard/compliance"
      case "caregiver":
        return "/dashboard/caregiver"
      case "pharmco":
        return "/dashboard/pharmco"
      case "researcher":
        return "/dashboard/researcher"
      case "superadmin":
        return "/dashboard/superadmin"
      default:
        return "/dashboard/patient"
    }
  }

  /**
   * Login function
   * @param {Object} credentials - User credentials
   * @param {string} redirectPath - Path to redirect after login (optional)
   */
  const login = useCallback(
    async (credentials, redirectPath) => {
      try {
        setLoading(true)
        const response = await authService.login(credentials)

        // Handle email verification required
        if (response.email_verification_required) {
          router.push("/auth/request-verification")
          return { success: false, email_verification_required: true }
        }

        // Handle 2FA if required
        if (response.requires_2fa) {
          router.push("/auth/two-factor")
          return { success: false, requires_2fa: true }
        }

        // Set user
        setUser(response.user)

        // Determine redirect path based on user role if not explicitly provided
        const targetPath = redirectPath || getDashboardRoute(response.user.role)

        router.push(targetPath)
        toast.success("Login successful")
        return { success: true }
      } catch (err) {
        setError(err.message)
        toast.error(err.message || "Login failed")
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [router],
  )

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true)
      await authService.logout()
      setUser(null)
      router.push("/auth/login")
      toast.success("Logout successful")
    } catch (err) {
      console.error("Logout error:", err)
      // Force logout even if API call fails
      setUser(null)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }, [router])

  /**
   * Register function
   * @param {Object} userData - User registration data
   */
  const register = useCallback(
    async (userData) => {
      try {
        setLoading(true)
        const response = await authService.register(userData)
        toast.success("Registration successful. Please wait for account approval.")
        router.push("/auth/login")
        return { success: true }
      } catch (err) {
        setError(err.message)
        toast.error(err.message || "Registration failed")
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [router],
  )

  /**
   * Verify 2FA code
   * @param {Object} data - 2FA verification data
   */
  const verify2FA = useCallback(
    async (data, redirectPath = "/dashboard") => {
      try {
        setLoading(true)
        const response = await authService.verify2FA(data)
        setUser(response.user)
        router.push(redirectPath)
        toast.success("Two-factor authentication successful")
        return { success: true }
      } catch (err) {
        setError(err.message)
        toast.error(err.message || "Two-factor authentication failed")
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [router],
  )

  /**
   * Request password reset
   * @param {string} email - User email
   */
  const requestPasswordReset = useCallback(async (email) => {
    try {
      setLoading(true)
      await authService.requestPasswordReset(email)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Reset password with token
   * @param {Object} resetData - Password reset data
   */
  const resetPassword = useCallback(
    async (resetData) => {
      try {
        setLoading(true)
        await authService.resetPassword(resetData)
        router.push("/auth/login")
        return { success: true }
      } catch (err) {
        setError(err.message)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [router],
  )

  /**
   * Verify email with token
   * @param {Object} verificationData - Email verification data
   */
  const verifyEmail = useCallback(
    async (verificationData) => {
      try {
        setLoading(true)
        await authService.verifyEmail(verificationData)
        router.push("/auth/login")
        return { success: true }
      } catch (err) {
        setError(err.message)
        return { success: false, error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [router],
  )

  /**
   * Request email verification
   */
  const requestEmailVerification = useCallback(async () => {
    try {
      setLoading(true)
      await authService.requestEmailVerification()
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Setup 2FA
   */
  const setup2FA = useCallback(async () => {
    try {
      setLoading(true)
      const response = await authService.setup2FA()
      return { success: true, data: response }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Confirm 2FA setup
   * @param {string} code - 2FA verification code
   */
  const confirm2FA = useCallback(async (code) => {
    try {
      setLoading(true)
      await authService.confirm2FA(code)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Disable 2FA
   * @param {string} code - 2FA verification code
   */
  const disable2FA = useCallback(async (code) => {
    try {
      setLoading(true)
      await authService.disable2FA(code)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update user consent
   * @param {Object} consentData - Consent data
   */
  const updateConsent = useCallback(async (consentData) => {
    try {
      setLoading(true)
      await authService.updateConsent(consentData)
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    verify2FA,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    requestEmailVerification,
    setup2FA,
    confirm2FA,
    disable2FA,
    updateConsent,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to use the auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default AuthContext
