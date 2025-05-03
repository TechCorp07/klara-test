"use client"

export const dynamic = "force-dynamic"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

/**
 * Email Verification Component
 * Verifies email using token from URL
 */
const EmailVerification = () => {
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get("token")

        if (!token) {
          throw new Error("Verification token is missing")
        }

        // Call the API to verify email
        const response = await fetch("/api/users/verify-email/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
          credentials: "same-origin",
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Email verification failed")
        }

        setVerified(true)
        toast.success("Email verified successfully")

        // Redirect to dashboard after successful verification
        setTimeout(() => {
          router.push("/dashboard")
        }, 3000)
      } catch (error) {
        console.error("Email verification error:", error)
        setError(error.message || "Email verification failed")
        toast.error(error.message || "Email verification failed")
      } finally {
        setVerifying(false)
      }
    }

    verifyEmail()
  }, [router])

  return (
    <div className="email-verification">
      <h2>Email Verification</h2>

      {verifying && (
        <div className="verifying-message">
          <p>Verifying your email address...</p>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {!verifying && verified && (
        <div className="success-message">
          <p>Your email has been successfully verified!</p>
          <p>You will be redirected to the dashboard in a few seconds...</p>
        </div>
      )}

      {!verifying && !verified && (
        <div className="error-message">
          <p>We couldn't verify your email address.</p>
          <p className="text-danger">{error}</p>
          <p>Please try again or contact support if the problem persists.</p>
          <button className="btn btn-primary mt-4" onClick={() => router.push("/request-verification")}>
            Request New Verification
          </button>
        </div>
      )}
    </div>
  )
}

export default EmailVerification
