// /api/auth/confirm-2fa.js
import { NextResponse } from "next/server"
import authAPI from "@/api/auth"

/**
 * API route handler for confirming 2FA setup
 * Verifies the code entered by the user to complete 2FA setup
 *
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} - The response object
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ message: "Verification code is required" }, { status: 400 })
    }

    // Call the auth API to confirm 2FA setup
    const response = await authAPI.confirm2FA({ code })

    return NextResponse.json(
      {
        success: true,
        message: "Two-factor authentication has been enabled successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("2FA confirmation error:", error)

    return NextResponse.json(
      { message: error.response?.data?.detail || "Failed to confirm 2FA setup" },
      { status: error.response?.status || 500 },
    )
  }
}
