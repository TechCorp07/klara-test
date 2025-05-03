"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import { useAuth } from "@/contexts/AuthContext"

export default function RegisterClient() {
  const { register: authRegister } = useAuth()
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState("patient")
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch("password", "")

  const onSubmit = async (data) => {
    // Ensure password confirmation matches
    if (data.password !== data.password_confirm) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      // Prepare registration data
      const registrationData = {
        username: data.username,
        email: data.email,
        password: data.password,
        password_confirm: data.password_confirm,
        first_name: data.first_name,
        last_name: data.last_name,
        role: role,
        phone_number: data.phone_number,
        date_of_birth: data.date_of_birth,
        terms_accepted: data.terms_accepted,
      }

      const result = await authRegister(registrationData)

      if (result.success) {
        toast.success("Registration successful! Please log in.")
        router.push("/auth/login")
      }
    } catch (error) {
      let errorMessage = "Registration failed. Please try again."

      if (error.response) {
        // Handle specific validation errors
        const responseData = error.response.data

        if (responseData.username) {
          errorMessage = `Username: ${responseData.username[0]}`
        } else if (responseData.email) {
          errorMessage = `Email: ${responseData.email[0]}`
        } else if (responseData.password) {
          errorMessage = `Password: ${responseData.password[0]}`
        } else if (responseData.non_field_errors) {
          errorMessage = responseData.non_field_errors[0]
        }
      }

      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-blue-600">Klararety Health</h1>
        <h2 className="mt-2 text-center text-2xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Account Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Type</label>
              <div className="mt-1 grid grid-cols-2 gap-3">
                <div
                  className={`border rounded-md p-3 cursor-pointer ${
                    role === "patient" ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-300"
                  }`}
                  onClick={() => setRole("patient")}
                >
                  <span className="block text-sm font-medium">Patient</span>
                  <span className="block text-xs text-gray-500">Individual seeking care</span>
                </div>
                <div
                  className={`border rounded-md p-3 cursor-pointer ${
                    role === "provider" ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-300"
                  }`}
                  onClick={() => setRole("provider")}
                >
                  <span className="block text-sm font-medium">Provider</span>
                  <span className="block text-xs text-gray-500">Healthcare professional</span>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  First name
                </label>
                <div className="mt-1">
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    autoComplete="given-name"
                    required
                    className="form-input"
                    {...register("first_name", { required: "First name is required" })}
                  />
                  {errors.first_name && <p className="form-error">{errors.first_name.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Last name
                </label>
                <div className="mt-1">
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    autoComplete="family-name"
                    required
                    className="form-input"
                    {...register("last_name", { required: "Last name is required" })}
                  />
                  {errors.last_name && <p className="form-error">{errors.last_name.message}</p>}
                </div>
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="form-input"
                  {...register("username", {
                    required: "Username is required",
                    minLength: { value: 4, message: "Username must be at least 4 characters" },
                  })}
                />
                {errors.username && <p className="form-error">{errors.username.message}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="form-input"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                Phone number
              </label>
              <div className="mt-1">
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  autoComplete="tel"
                  required
                  className="form-input"
                  {...register("phone_number", {
                    required: "Phone number is required",
                  })}
                />
                {errors.phone_number && <p className="form-error">{errors.phone_number.message}</p>}
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">
                Date of birth
              </label>
              <div className="mt-1">
                <input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  required
                  className="form-input"
                  {...register("date_of_birth", {
                    required: "Date of birth is required",
                  })}
                />
                {errors.date_of_birth && <p className="form-error">{errors.date_of_birth.message}</p>}
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="form-input"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                  })}
                />
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <div className="mt-1">
                <input
                  id="password_confirm"
                  name="password_confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="form-input"
                  {...register("password_confirm", {
                    required: "Please confirm your password",
                    validate: (value) => value === password || "The passwords do not match",
                  })}
                />
                {errors.password_confirm && <p className="form-error">{errors.password_confirm.message}</p>}
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms_accepted"
                  name="terms_accepted"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  {...register("terms_accepted", {
                    required: "You must agree to the terms and conditions",
                  })}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms_accepted" className="font-medium text-gray-700">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                    terms and conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                    privacy policy
                  </Link>
                </label>
                {errors.terms_accepted && <p className="form-error">{errors.terms_accepted.message}</p>}
              </div>
            </div>

            <div>
              <button type="submit" disabled={loading} className="auth-form-button disabled:opacity-50">
                {loading ? (
                  <span className="flex items-center">
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
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
