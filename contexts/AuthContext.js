// Updated AuthContext.js with corrected API endpoints
"use client"

import { createContext, useState, useEffect, useContext, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { token as tokenAPI } from "../api"
import { getApiBaseUrl } from "../api/client"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [twoFactorToken, setTwoFactorToken] = useState(null)
  const [tokens, setTokens] = useState({
    accessToken: null,
    refreshToken: null,
  })
  const refreshTimeoutRef = useRef(null)
  const router = useRouter()
  const queryClient = useQueryClient()

  // Function to refresh the access token
  const refreshAccessToken = useCallback(async () => {
    if (!tokens.refreshToken) return false

    try {
      const result = await tokenAPI.refreshToken(tokens.refreshToken)
      if (result && result.access) {
        setTokens((prev) => ({
          ...prev,
          accessToken: result.access,
        }))

        // Store the new access token
        localStorage.setItem("access_token", result.access)

        // Schedule the next refresh
        scheduleTokenRefresh(result.access)
        return true
      }
      return false
    } catch (error) {
      console.error("Token refresh failed:", error)
      // If refresh fails, log the user out
      handleTokenRefreshFailure()
      return false
    }
  }, [tokens.refreshToken])

  // Schedule token refresh before it expires
  const scheduleTokenRefresh = useCallback(
    (token) => {
      // Clear any existing timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }

      // Parse the token to get expiration time
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        const expiresIn = payload.exp * 1000 - Date.now()

        // Schedule refresh at 90% of token lifetime
        const refreshTime = Math.max(0, expiresIn * 0.9)

        refreshTimeoutRef.current = setTimeout(() => {
          refreshAccessToken()
        }, refreshTime)
      } catch (error) {
        console.error("Error scheduling token refresh:", error)
      }
    },
    [refreshAccessToken],
  )

  // Handle token refresh failure
  const handleTokenRefreshFailure = useCallback(() => {
    // Clear tokens
    setTokens({
      accessToken: null,
      refreshToken: null,
    })

    // Clear local storage
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")

    // Reset user state
    setUser(null)

    // Redirect to login
    router.push("/login")
  }, [router])

  // Initialize tokens from localStorage on mount
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token")
    const refreshToken = localStorage.getItem("refresh_token")

    if (accessToken && refreshToken) {
      setTokens({
        accessToken,
        refreshToken,
      })

      // Schedule refresh for the access token
      scheduleTokenRefresh(accessToken)
    }

    return () => {
      // Clear timeout on unmount
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [scheduleTokenRefresh])

  // Fetch current user if already authenticated
  const { data: currentUser, isLoading: isUserLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        // Try to use the access token if available
        const headers = {}
        if (tokens.accessToken) {
          headers["Authorization"] = `Bearer ${tokens.accessToken}`
        }

        const baseUrl = getApiBaseUrl()
        const res = await fetch(`${baseUrl}/api/users/me/`, {
          headers,
          credentials: "include",
          mode: "cors",
        })

        if (!res.ok) {
          // If unauthorized and we have a refresh token, try to refresh
          if (res.status === 401 && tokens.refreshToken) {
            const refreshed = await refreshAccessToken()
            if (refreshed) {
              // Retry with new token
              const baseUrl = getApiBaseUrl()
              const retryRes = await fetch(`${baseUrl}/api/users/me/`, {
                headers: {
                  Authorization: `Bearer ${tokens.accessToken}`,
                },
                credentials: "include",
                mode: "cors",
              })

              if (retryRes.ok) {
                const data = await retryRes.json()
                return data.user
              }
            }
          }
          throw new Error("Authentication failed")
        }

        const data = await res.json()
        return data.user
      } catch (error) {
        console.error("Error fetching user:", error)
        throw error
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
    onSuccess: (data) => {
      if (data) setUser(data)
    },
    onError: () => {
      setUser(null)
      setTokens({
        accessToken: null,
        refreshToken: null,
      })
      setLoading(false)
    },
  })

  // Set loading state based on user query
  useEffect(() => {
    setLoading(isUserLoading)
  }, [isUserLoading])

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const baseUrl = getApiBaseUrl()
      const res = await fetch(`${baseUrl}/api/users/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include",
        mode: "cors",
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Login failed")
      }

      return res.json()
    },
    onSuccess: (data) => {
      if (data.requires2FA) {
        setRequiresTwoFactor(true)
        setTwoFactorToken(data.token)
        return
      }

      // Store tokens if provided
      if (data.access && data.refresh) {
        setTokens({
          accessToken: data.access,
          refreshToken: data.refresh,
        })

        // Store tokens in localStorage
        localStorage.setItem("access_token", data.access)
        localStorage.setItem("refresh_token", data.refresh)

        // Schedule token refresh
        scheduleTokenRefresh(data.access)
      }

      setUser(data.user)
      setRequiresTwoFactor(false)
      setTwoFactorToken(null)
      queryClient.setQueryData(["currentUser"], data.user)
    },
  })

  // 2FA verification mutation
  const verify2FAMutation = useMutation({
    mutationFn: async (code) => {
      const baseUrl = getApiBaseUrl()
      const res = await fetch(`${baseUrl}/api/users/verify-2fa/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: twoFactorToken, code }),
        credentials: "include",
        mode: "cors",
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Verification failed")
      }

      return res.json()
    },
    onSuccess: (data) => {
      // Store tokens if provided
      if (data.access && data.refresh) {
        setTokens({
          accessToken: data.access,
          refreshToken: data.refresh,
        })

        // Store tokens in localStorage
        localStorage.setItem("access_token", data.access)
        localStorage.setItem("refresh_token", data.refresh)

        // Schedule token refresh
        scheduleTokenRefresh(data.access)
      }

      setUser(data.user)
      setRequiresTwoFactor(false)
      setTwoFactorToken(null)
      queryClient.setQueryData(["currentUser"], data.user)
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Include access token in the request if available
      const headers = {}
      if (tokens.accessToken) {
        headers["Authorization"] = `Bearer ${tokens.accessToken}`
      }

      const baseUrl = getApiBaseUrl()
      const res = await fetch(`${baseUrl}/api/users/logout/`, {
        method: "POST",
        headers,
        credentials: "include",
        mode: "cors",
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Logout failed")
      }

      return res.json()
    },
    onSuccess: () => {
      // Clear user state
      setUser(null)

      // Clear tokens
      setTokens({
        accessToken: null,
        refreshToken: null,
      })

      // Clear token refresh timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
        refreshTimeoutRef.current = null
      }

      // Remove tokens from localStorage
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")

      // Clear query cache
      queryClient.clear()

      // Redirect to login
      router.push("/login")
    },
  })

  // Profile update mutation with optimistic updates
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      // Include access token in the request if available
      const headers = {
        "Content-Type": "application/json",
      }

      if (tokens.accessToken) {
        headers["Authorization"] = `Bearer ${tokens.accessToken}`
      }

      const baseUrl = getApiBaseUrl()
      const res = await fetch(`${baseUrl}/api/users/me/`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
        credentials: "include",
        mode: "cors",
      })

      if (!res.ok) {
        // If unauthorized and we have a refresh token, try to refresh
        if (res.status === 401 && tokens.refreshToken) {
          const refreshed = await refreshAccessToken()
          if (refreshed) {
            // Retry with new token
            const baseUrl = getApiBaseUrl()
            const retryRes = await fetch(`${baseUrl}/api/users/me/`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokens.accessToken}`,
              },
              body: JSON.stringify(data),
              credentials: "include",
              mode: "cors",
            })

            if (retryRes.ok) {
              return retryRes.json()
            }
          }
        }

        const errorData = await res.json()
        throw new Error(errorData.message || "Profile update failed")
      }

      return res.json()
    },
    onMutate: async (newData) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["currentUser"] })

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData(["currentUser"])

      // Optimistically update to the new value
      queryClient.setQueryData(["currentUser"], (old) => ({
        ...old,
        ...newData,
      }))

      // Update local state
      setUser((prev) => ({
        ...prev,
        ...newData,
      }))

      // Return context with the previous user
      return { previousUser }
    },
    onSuccess: (data) => {
      setUser(data.user)
      queryClient.setQueryData(["currentUser"], data.user)
      toast.success("Profile updated successfully")
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousUser) {
        queryClient.setQueryData(["currentUser"], context.previousUser)
        setUser(context.previousUser)
      }
      toast.error(error.message || "Profile update failed")
    },
  })

  // Helper functions
  const login = useCallback(
    async (credentials) => {
      try {
        const result = await loginMutation.mutateAsync(credentials)
        return {
          success: !result.requires2FA,
          requires2FA: result.requires2FA,
        }
      } catch (error) {
        console.error("Login error:", error)
        toast.error(error.message || "Login failed")
        throw error
      }
    },
    [loginMutation],
  )

  const verify2FA = useCallback(
    async (code) => {
      try {
        const result = await verify2FAMutation.mutateAsync(code)
        return { success: true, user: result.user }
      } catch (error) {
        console.error("2FA verification error:", error)
        toast.error(error.message || "2FA verification failed")
        throw error
      }
    },
    [verify2FAMutation],
  )

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch (error) {
      console.error("Logout error:", error)
      // Force logout even if API call fails
      setUser(null)
      queryClient.clear()
      router.push("/login")
    }
  }, [logoutMutation, queryClient, router])

  const updateProfile = useCallback(
    async (data) => {
      try {
        const result = await updateProfileMutation.mutateAsync(data)
        return result.user
      } catch (error) {
        console.error("Profile update error:", error)
        throw error
      }
    },
    [updateProfileMutation],
  )

  // 2FA setup and management mutations (kept for compatibility)
  const setup2FAMutation = useMutation({
    mutationFn: async () => {
      const baseUrl = getApiBaseUrl()
      const res = await fetch(`${baseUrl}/api/users/setup-2fa/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(tokens.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
        },
        credentials: "include",
        mode: "cors",
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "2FA setup failed")
      }

      return res.json()
    },
  })

  const confirm2FAMutation = useMutation({
    mutationFn: async (code) => {
      const baseUrl = getApiBaseUrl()
      const res = await fetch(`${baseUrl}/api/users/confirm-2fa/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(tokens.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
        },
        body: JSON.stringify({ code }),
        credentials: "include",
        mode: "cors",
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "2FA confirmation failed")
      }

      return res.json()
    },
    onSuccess: () => {
      setUser((prev) => ({ ...prev, two_factor_enabled: true }))
      queryClient.setQueryData(["currentUser"], (prev) => ({ ...prev, two_factor_enabled: true }))
      toast.success("Two-factor authentication enabled")
    },
  })

  const disable2FAMutation = useMutation({
    mutationFn: async (password) => {
      const baseUrl = getApiBaseUrl()
      const res = await fetch(`${baseUrl}/api/users/disable-2fa/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(tokens.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
        },
        body: JSON.stringify({ password }),
        credentials: "include",
        mode: "cors",
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "2FA disabling failed")
      }

      return res.json()
    },
    onSuccess: () => {
      setUser((prev) => ({ ...prev, two_factor_enabled: false }))
      queryClient.setQueryData(["currentUser"], (prev) => ({ ...prev, two_factor_enabled: false }))
      toast.success("Two-factor authentication disabled")
    },
  })

  // 2FA helper functions
  const setup2FA = useCallback(async () => {
    try {
      return await setup2FAMutation.mutateAsync()
    } catch (error) {
      console.error("2FA setup error:", error)
      toast.error(error.message || "2FA setup failed")
      throw error
    }
  }, [setup2FAMutation])

  const confirm2FA = useCallback(
    async (code) => {
      try {
        return await confirm2FAMutation.mutateAsync(code)
      } catch (error) {
        console.error("2FA confirmation error:", error)
        toast.error(error.message || "2FA confirmation failed")
        throw error
      }
    },
    [confirm2FAMutation],
  )

  const disable2FA = useCallback(
    async (password) => {
      try {
        return await disable2FAMutation.mutateAsync(password)
      } catch (error) {
        console.error("2FA disabling error:", error)
        toast.error(error.message || "2FA disabling failed")
        throw error
      }
    },
    [disable2FAMutation],
  )

  // Password reset mutations
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email) => {
      const baseUrl = getApiBaseUrl()
      const res = await fetch(`${baseUrl}/api/users/forgot-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
        mode: "cors",
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Password reset request failed")
      }

      return res.json()
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: async (data) => {
      const baseUrl = getApiBaseUrl()
      const res = await fetch(`${baseUrl}/api/users/reset-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
        mode: "cors",
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Password reset failed")
      }

      return res.json()
    },
  })

  // Password reset helper functions
  const forgotPassword = useCallback(
    async (email) => {
      try {
        const result = await forgotPasswordMutation.mutateAsync(email)
        toast.success("Password reset instructions sent to your email")
        return result
      } catch (error) {
        console.error("Forgot password error:", error)
        toast.error(error.message || "Password reset request failed")
        throw error
      }
    },
    [forgotPasswordMutation],
  )

  const resetPassword = useCallback(
    async (data) => {
      try {
        const result = await resetPasswordMutation.mutateAsync(data)
        toast.success("Password reset successfully")
        return result
      } catch (error) {
        console.error("Reset password error:", error)
        toast.error(error.message || "Password reset failed")
        throw error
      }
    },
    [resetPasswordMutation],
  )

  // Email verification mutations
  const requestEmailVerificationMutation = useMutation({
    mutationFn: async () => {
      const baseUrl = getApiBaseUrl()
      const res = await fetch(`${baseUrl}/api/users/request-email-verification/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(tokens.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
        },
        credentials: "include",
        mode: "cors",
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Email verification request failed")
      }

      return res.json()
    },
  })

  const verifyEmailMutation = useMutation({
    mutationFn: async (token) => {
      const baseUrl = getApiBaseUrl()
      const res = await fetch(`${baseUrl}/api/users/verify-email/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
        credentials: "include",
        mode: "cors",
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Email verification failed")
      }

      return res.json()
    },
    onSuccess: () => {
      setUser((prev) => ({ ...prev, email_verified: true }))
      queryClient.setQueryData(["currentUser"], (prev) => ({ ...prev, email_verified: true }))
      toast.success("Email verified successfully")
    },
  })

  // Email verification helper functions
  const requestEmailVerification = useCallback(async () => {
    try {
      const result = await requestEmailVerificationMutation.mutateAsync()
      toast.success("Verification email sent")
      return result
    } catch (error) {
      console.error("Email verification request error:", error)
      toast.error(error.message || "Email verification request failed")
      throw error
    }
  }, [requestEmailVerificationMutation])

  const verifyEmail = useCallback(
    async (token) => {
      try {
        const result = await verifyEmailMutation.mutateAsync(token)
        return result
      } catch (error) {
        console.error("Email verification error:", error)
        toast.error(error.message || "Email verification failed")
        throw error
      }
    },
    [verifyEmailMutation],
  )

  // Consent update mutation
  const updateConsentMutation = useMutation({
    mutationFn: async (consentData) => {
      const baseUrl = getApiBaseUrl()
      const res = await fetch(`${baseUrl}/api/users/update-consent/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(tokens.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
        },
        body: JSON.stringify(consentData),
        credentials: "include",
        mode: "cors",
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Consent update failed")
      }

      return res.json()
    },
    onSuccess: (data) => {
      setUser((prev) => ({ ...prev, consents: data.consents }))
      queryClient.setQueryData(["currentUser"], (prev) => ({ ...prev, consents: data.consents }))
      toast.success("Consent updated successfully")
    },
  })

  // Consent update helper function
  const updateConsent = useCallback(
    async (consentData) => {
      try {
        const result = await updateConsentMutation.mutateAsync(consentData)
        return result
      } catch (error) {
        console.error("Consent update error:", error)
        toast.error(error.message || "Consent update failed")
        throw error
      }
    },
    [updateConsentMutation],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        requiresTwoFactor,
        login,
        verify2FA,
        logout,
        updateProfile,
        setup2FA,
        confirm2FA,
        disable2FA,
        forgotPassword,
        resetPassword,
        requestEmailVerification,
        verifyEmail,
        updateConsent,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
