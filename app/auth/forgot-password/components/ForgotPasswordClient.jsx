"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

/**
 * Client component for forgot-password page
 */
export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // API call to request password reset
      const response = await fetch("auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to request password reset")
      }

      setIsSubmitted(true)
      toast.success("Password reset instructions have been sent to your email")
    } catch (error) {
      console.error("Password reset request error:", error)
      toast.error(error.message || "Failed to request password reset. Please try again.")
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
          <p className="auth-form-subtitle">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {!isSubmitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="auth-form-input"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
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
                  "Send Reset Instructions"
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400 dark:text-green-300"
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
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Email sent</h3>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                    <p>
                      We've sent password reset instructions to {email}. Please check your inbox and follow the
                      instructions to reset your password.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or{" "}
              <button type="button" onClick={() => setIsSubmitted(false)} className="auth-form-link">
                try again
              </button>
            </p>
          </div>
        )}

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
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
