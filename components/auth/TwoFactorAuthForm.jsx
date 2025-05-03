// components/auth/TwoFactorAuthForm.js
"use client"

import { useState, useEffect } from "react"
import { FaLock, FaExclamationTriangle, FaSync, FaInfoCircle } from "react-icons/fa"
/**
 * Two-factor authentication form component
 * Handles both verification and setup flows
 *
 * @param {Object} props
 * @param {Function} props.onVerify - Callback when verification is submitted
 * @param {Function} props.onCancel - Callback when form is cancelled
 * @param {boolean} props.isSetup - Whether this is for initial setup
 * @param {string} props.qrCodeUrl - QR code URL for setup
 * @param {string} props.secretKey - Secret key for manual entry
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 */
const TwoFactorAuthForm = ({
  onVerify,
  onCancel,
  isSetup = false,
  qrCodeUrl = null,
  secretKey = null,
  loading = false,
  error = null,
}) => {
  const [verificationCode, setVerificationCode] = useState("")
  const [manualEntry, setManualEntry] = useState(false)

  // Reset form when props change
  useEffect(() => {
    setVerificationCode("")
  }, [isSetup, qrCodeUrl])

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()

    if (verificationCode.length !== 6) {
      return
    }

    if (onVerify) {
      onVerify(verificationCode)
    }
  }

  // Handle input change - ensure only digits
  const handleCodeChange = (e) => {
    const value = e.target.value
    // Only allow digits
    const sanitizedValue = value.replace(/\D/g, "")
    // Limit to 6 digits
    setVerificationCode(sanitizedValue.slice(0, 6))
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="rounded-full p-2 bg-blue-100 text-blue-600">
            <FaLock className="h-5 w-5" />
          </div>
          <h2 className="ml-3 text-lg font-medium text-gray-900">
            {isSetup ? "Set Up Two-Factor Authentication" : "Two-Factor Authentication"}
          </h2>
        </div>
      </div>

      <div className="px-6 py-4">
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isSetup && qrCodeUrl && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code with your authenticator app to set up two-factor authentication.
            </p>

            <div className="flex flex-col items-center justify-center mb-4">
              <div className="bg-white p-4 rounded-lg border border-gray-300">
                <img src={qrCodeUrl} alt="QR Code for 2FA Setup" className="h-48 w-48" />
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={() => setManualEntry(!manualEntry)}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {manualEntry ? "Hide manual entry" : "Can't scan the code?"}
              </button>
            </div>

            {manualEntry && secretKey && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  If you can't scan the QR code, you can manually enter this key in your authenticator app:
                </p>

                <div className="bg-gray-100 px-4 py-2 rounded-md font-mono text-sm text-center">{secretKey}</div>
              </div>
            )}
          </div>
        )}

        {!isSetup && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Enter the verification code from your authenticator app to continue.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>

            <div className="flex">
              <input
                type="text"
                id="verification-code"
                value={verificationCode}
                onChange={handleCodeChange}
                placeholder="Enter 6-digit code"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                required
              />
            </div>

            <div className="mt-2 flex justify-between items-center">
              <div className="flex">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-8 mx-1 rounded-full ${
                      index < verificationCode.length ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  ></div>
                ))}
              </div>

              {verificationCode.length > 0 && (
                <button
                  type="button"
                  onClick={() => setVerificationCode("")}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FaSync className="animate-spin mr-2 h-4 w-4" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </button>
          </div>
        </form>

        {!isSetup && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FaInfoCircle className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Don't have access to your authenticator app?</h4>
                <p className="mt-1 text-sm text-gray-500">
                  If you're unable to access your authenticator app, please contact support for assistance.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TwoFactorAuthForm
