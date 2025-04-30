// contexts/AuthContext.js
"use client"

import { createContext, useState, useEffect, useContext, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [twoFactorToken, setTwoFactorToken] = useState(null)
  const router = useRouter()
  const queryClient = useQueryClient()

  // Fetch current user if already authenticated
  const { data: currentUser, isLoading: isUserLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "same-origin",
        })
        if (!res.ok) {
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "same-origin",
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

      setUser(data.user)
      setRequiresTwoFactor(false)
      setTwoFactorToken(null)
      queryClient.setQueryData(["currentUser"], data.user)
    },
  })

  // 2FA verification mutation
  const verify2FAMutation = useMutation({
    mutationFn: async (code) => {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: twoFactorToken, code }),
        credentials: "same-origin",
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Verification failed")
      }

      return res.json()
    },
    onSuccess: (data) => {
      setUser(data.user)
      setRequiresTwoFactor(false)
      setTwoFactorToken(null)
      queryClient.setQueryData(["currentUser"], data.user)
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Logout failed")
      }

      return res.json()
    },
    onSuccess: () => {
      setUser(null)
      queryClient.clear()
      router.push("/login")
    },
  })

  // Profile update mutation with optimistic updates
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "same-origin",
      })

      if (!res.ok) {
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
      const res = await fetch("/api/auth/setup-2fa", {
        method: "POST",
        credentials: "same-origin",
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
      const res = await fetch("/api/auth/confirm-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
        credentials: "same-origin",
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
      const res = await fetch("/api/auth/disable-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
        credentials: "same-origin",
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

  const value = {
    user,
    loading,
    requiresTwoFactor,
    isAuthenticated: !!user,
    login,
    verify2FA,
    logout,
    updateProfile,
    setup2FA,
    confirm2FA,
    disable2FA,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
