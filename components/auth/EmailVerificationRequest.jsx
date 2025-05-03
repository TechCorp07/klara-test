"use client"

import React, { useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"

/**
 * Email Verification Request Component
 * Allows users to request email verification
 */
const EmailVerificationRequest = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { user } = useAuth()

  // Pre-fill with user's email if available
  React.useEffect(() => {
    if (user && user.email) {
      setEmail(user.email)
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      toast.error("Please enter your email address")
      return
    }

    try {
      setLoading(true)

      // Call the API to request email verification
      const response = await fetch("users/request-email-verification/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "same-origin",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to request email verification")
      }

      setSent(true)
      toast.success("Verification email sent successfully")
    } catch (error) {
      console.error("Email verification request error:", error)
      toast.error(error.message || "Failed to request email verification")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="email-verification-request">
      <h2>Email Verification</h2>

      {sent ? (
        <div className="success-message">
          <p>
            A verification email has been sent to <strong>{email}</strong>.
          </p>
          <p>Please check your inbox and follow the instructions to verify your email address.</p>
          <button className="btn btn-secondary mt-4" onClick={() => setSent(false)}>
            Send Again
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
            {loading ? "Sending..." : "Send Verification Email"}
          </button>
        </form>
      )}
    </div>
  )
}

export default EmailVerificationRequest
