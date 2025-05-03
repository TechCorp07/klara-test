"use client"

export const dynamic = "force-dynamic"
import { useState, useEffect } from "react"
import { toast } from "react-toastify"

/**
 * ProfileEmailVerification Component
 * Allows users to verify their email address from their profile section
 */
const ProfileEmailVerification = ({ user }) => {
  const [verificationStatus, setVerificationStatus] = useState({
    isVerified: user?.email_verified || false,
    verificationSent: false,
    isLoading: false,
    error: null,
  })

  // Request email verification
  const requestVerification = async () => {
    try {
      setVerificationStatus((prev) => ({
        ...prev,
        isLoading,
        error: null,
      }))

      const response = await fetch("/api/auth/request-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to request email verification")
      }

      setVerificationStatus((prev) => ({
        ...prev,
        verificationSent: true,
      }))

      toast.success("Verification email sent. Please check your inbox.")
    } catch (error) {
      console.error("Error requesting verification:", error)
      setVerificationStatus((prev) => ({
        ...prev,
        error: error.message || "Failed to request verification. Please try again.",
      }))
      toast.error(error.message || "Failed to request verification. Please try again.")
    } finally {
      setVerificationStatus((prev) => ({
        ...prev,
        isLoading: false,
      }))
    }
  }

  // Check verification status
  const checkVerificationStatus = async () => {
    try {
      const response = await fetch("/api/users/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch user data")
      }

      const userData = await response.json()

      setVerificationStatus((prev) => ({
        ...prev,
        isVerified: userData.email_verified || false,
      }))
    } catch (error) {
      console.error("Error checking verification status:", error)
    }
  }

  // Check status when verification sent is true
  useEffect(() => {
    if (verificationStatus.verificationSent) {
      const interval = setInterval(checkVerificationStatus, 10000) // Check every 10 seconds

      return () => clearInterval(interval)
    }
  }, [verificationStatus.verificationSent])

  return (
    <div className="profile-email-verification card mb-4">
      <div className="card-header">
        <h5 className="mb-0">Email Verification</h5>
      </div>
      <div className="card-body">
        {verificationStatus.isVerified ? (
          <div className="verified-status">
            <div className="d-flex align-items-center">
              <i className="bi bi-check-circle-fill text-success me-2 fs-4"></i>
              <div>
                <h6 className="mb-0">Email Verified</h6>
                <p className="text-muted mb-0">Your email address has been verified.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="unverified-status">
            <div className="d-flex align-items-center mb-3">
              <i className="bi bi-exclamation-triangle-fill text-warning me-2 fs-4"></i>
              <div>
                <h6 className="mb-0">Email Not Verified</h6>
                <p className="text-muted mb-0">Please verify your email address to access all features.</p>
              </div>
            </div>

            {verificationStatus.verificationSent ? (
              <div className="alert alert-info">
                <p className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Verification email sent. Please check your inbox and click the verification link.
                </p>
                <p className="mb-0 mt-2">
                  <small>Didn't receive the email? Check your spam folder or request a new verification email.</small>
                </p>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={requestVerification} disabled={verificationStatus.isLoading}>
                {verificationStatus.isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Sending...
                  </>
                ) : (
                  "Verify Email"
                )}
              </button>
            )}

            {verificationStatus.error && (
              <div className="alert alert-danger mt-3">
                <p className="mb-0">{verificationStatus.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileEmailVerification
