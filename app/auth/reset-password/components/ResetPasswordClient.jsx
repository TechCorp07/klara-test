"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import Image from "next/image"
import Link from "next/link"

/**
 * Client component for reset-password page
 */
export default function ResetPasswordClient() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [token, setToken] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // Get token from URL on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const tokenParam = urlParams.get("token")
      if (tokenParam) {
        setToken(tokenParam)
      }
    }
  }, [])

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long"
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter"
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter"
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number"
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return "Password must contain at least one special character"
    }
    return ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate password
    const error = validatePassword(password)
    if (error) {
      setPasswordError(error)
      return
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    setPasswordError("")
    setIsLoading(true)

    try {
      // API call to reset password
      const response = await fetch("auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to reset password")
      }

      setIsSubmitted(true)
      toast.success("Your password has been reset successfully")
    } catch (error) {
      console.error("Password reset error:", error)
      toast.error(error.message || "Failed to reset password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-form-container">
      <div className="auth-form">
        <div className="flex flex-col items-center">
          <Image
            src="/images/klararety-logo.png"
            alt="Klararety Logo"
            width={250}
            height={70}
            className="auth-form-logo"
            priority
          />
          <h2 className="auth-form-title">Reset your password</h2>
          <p className="auth-form-subtitle">Enter your new password below</p>
        </div>

        {!token && (
          <div className="mt-8 rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Invalid or missing reset token</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    The password reset link appears to be invalid or expired. Please request a new password reset link.
                  </p>
                </div>
                <div className="mt-4">
                  <Link href="/auth/forgot-password" className="auth-form-button inline-block text-center py-2 px-4">
                    Request new link
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {token && !isSubmitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="auth-form-input"
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters long and include uppercase, lowercase, number, and special
                character.
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="auth-form-input"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {passwordError && <p className="mt-1 text-sm text-error-600">{passwordError}</p>}
            </div>

            <div>
              <button type="submit" disabled={isLoading} className="auth-form-button">
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </form>
        ) : token && isSubmitted ? (
          <div className="mt-8 space-y-6">
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Password reset successful</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your password has been reset successfully. You can now log in with your new password.</p>
                  </div>
                  <div className="mt-4">
                    <Link href="/auth/login" className="auth-form-button inline-block text-center py-2 px-4">
                      Go to Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link href="/auth/login" className="auth-form-link">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
