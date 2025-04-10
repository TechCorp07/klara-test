"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { useAuth } from "../../contexts/AuthContext"
import AuthenticatedLayout from "../../components/layout/AuthenticatedLayout"
import { format } from "date-fns"
import { FaLock, FaShieldAlt } from "react-icons/fa"

export default function ProfilePage() {
  const { user, updateProfile, setup2FA, confirm2FA, disable2FA } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [setupMode, setSetupMode] = useState(false)
  const [qrCode, setQrCode] = useState(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [disableMode, setDisableMode] = useState(false)
  const [password, setPassword] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  // Set initial form values when user data is available
  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number || "",
      })
    }
  }, [user, reset])

  const onSubmit = async (data) => {
    setLoading(true)

    try {
      await updateProfile(data)
      setEditing(false)
    } catch (error) {
      let errorMessage = "Failed to update profile. Please try again."

      if (error.response && error.response.data) {
        // Format validation errors
        const responseData = error.response.data

        if (typeof responseData === "object") {
          const firstErrorKey = Object.keys(responseData)[0]
          if (firstErrorKey && responseData[firstErrorKey]) {
            errorMessage = `${firstErrorKey}: ${responseData[firstErrorKey][0]}`
          }
        }
      }

      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSetup2FA = async () => {
    setLoading(true)

    try {
      const response = await setup2FA()
      setQrCode(response.qr_code)
      setSetupMode(true)
    } catch (error) {
      toast.error("Failed to set up two-factor authentication. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code")
      return
    }

    setLoading(true)

    try {
      await confirm2FA(verificationCode)
      setSetupMode(false)
      setVerificationCode("")
    } catch (error) {
      toast.error("Invalid verification code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!password) {
      toast.error("Please enter your password")
      return
    }

    setLoading(true)

    try {
      await disable2FA(password)
      setDisableMode(false)
      setPassword("")
    } catch (error) {
      toast.error("Incorrect password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h1>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your account details</p>
            </div>

            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditing(false)
                  reset({
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone_number: user.phone_number || "",
                  })
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            )}
          </div>

          {editing ? (
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      id="first_name"
                      autoComplete="given-name"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      {...register("first_name", { required: "First name is required" })}
                    />
                    {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>}
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      id="last_name"
                      autoComplete="family-name"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      {...register("last_name", { required: "Last name is required" })}
                    />
                    {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>}
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      autoComplete="email"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                          message: "Invalid email address",
                        },
                      })}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      id="phone_number"
                      autoComplete="tel"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      {...register("phone_number")}
                    />
                    {errors.phone_number && <p className="mt-1 text-sm text-red-600">{errors.phone_number.message}</p>}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
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
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Full name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.first_name} {user.last_name}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Username</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.username}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.phone_number || "Not provided"}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.role_display || user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Member since</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {format(new Date(user.date_joined), "MMMM d, yyyy")}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {/* Security section */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Security</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your account security settings</p>
          </div>

          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="rounded-full p-2 bg-blue-100 text-blue-500">
                      <FaLock className="h-5 w-5" />
                    </div>
                    <h4 className="ml-3 text-lg font-medium text-gray-900">Password</h4>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Change your password regularly to keep your account secure.
                  </p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Change Password
                  </button>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="rounded-full p-2 bg-blue-100 text-blue-500">
                      <FaShieldAlt className="h-5 w-5" />
                    </div>
                    <h4 className="ml-3 text-lg font-medium text-gray-900">Two-Factor Authentication</h4>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {user.two_factor_enabled
                      ? "Two-factor authentication is enabled for your account."
                      : "Add an extra layer of security by enabling two-factor authentication."}
                  </p>
                  {user.two_factor_enabled ? (
                    <button
                      type="button"
                      onClick={() => setDisableMode(true)}
                      className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Disable 2FA
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSetup2FA}
                      className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Setup 2FA
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2FA Setup Modal */}
          {setupMode && (
            <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="relative bg-white rounded-lg max-w-md w-full mx-auto shadow-xl p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Setup Two-Factor Authentication</h3>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.).
                  </p>

                  <div className="flex justify-center my-4">
                    {qrCode && <div dangerouslySetInnerHTML={{ __html: qrCode }} />}
                  </div>

                  <div className="mt-4">
                    <label htmlFor="verification_code" className="block text-sm font-medium text-gray-700">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength="6"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="6-digit code"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setSetupMode(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleVerify2FA}
                    disabled={loading || verificationCode.length !== 6}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
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
                        Verifying...
                      </>
                    ) : (
                      "Verify and Enable"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2FA Disable Modal */}
          {disableMode && (
            <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="relative bg-white rounded-lg max-w-md w-full mx-auto shadow-xl p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Disable Two-Factor Authentication</h3>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-4">
                    Please enter your password to confirm disabling two-factor authentication.
                  </p>

                  <div className="mt-4">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDisableMode(false)
                      setPassword("")
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDisable2FA}
                    disabled={loading || !password}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
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
                        Disabling...
                      </>
                    ) : (
                      "Disable 2FA"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  )
}
