// /api/auth/disable-2fa.js
import { NextResponse } from "next/server"
import authAPI from "@/api/auth"

/**
 * API route handler for disabling 2FA
 * Requires password verification for security
 *
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} - The response object
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ message: "Password is required to disable 2FA" }, { status: 400 })
    }

    // Call the auth API to disable 2FA
    const response = await authAPI.disable2FA({ password })

    return NextResponse.json(
      {
        success: true,
        message: "Two-factor authentication has been disabled successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("2FA disabling error:", error)

    return NextResponse.json(
      { message: error.response?.data?.detail || "Failed to disable 2FA" },
      { status: error.response?.status || 500 },
    )
  }
}
