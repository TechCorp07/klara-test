// /api/auth/forgot-password.js
import { NextResponse } from "next/server"
import authAPI from "@/api/auth"

/**
 * API route handler for forgot password requests
 *
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} - The response object
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Call the auth API to request password reset
    const response = await authAPI.requestPasswordReset({ email })

    return NextResponse.json({ message: "Password reset instructions sent to your email" }, { status: 200 })
  } catch (error) {
    console.error("Forgot password error:", error)

    return NextResponse.json(
      { message: error.response?.data?.detail || "Failed to process password reset request" },
      { status: error.response?.status || 500 },
    )
  }
}
