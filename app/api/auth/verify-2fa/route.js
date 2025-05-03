// /api/auth/verify-2fa.js
import { NextResponse } from "next/server"
import authAPI from "@/api/auth"
import { cookies } from "next/headers"

/**
 * API route handler for verifying 2FA code
 *
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} - The response object
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { token, code } = body

    if (!token || !code) {
      return NextResponse.json({ message: "Token and verification code are required" }, { status: 400 })
    }

    // Call the auth API to verify 2FA code
    const response = await authAPI.verify2FA({ token, code })

    // Set auth cookies
    const cookieStore = cookies()
    if (response.access) {
      cookieStore.set("access_token", response.access, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60, // 1 hour
        path: "/",
      })
    }

    if (response.refresh) {
      cookieStore.set("refresh_token", response.refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      })
    }

    // Return user data without sensitive information
    return NextResponse.json(
      {
        success: true,
        user: {
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          first_name: response.user.first_name,
          last_name: response.user.last_name,
          role: response.user.role,
          two_factor_enabled: response.user.two_factor_enabled,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("2FA verification error:", error)

    return NextResponse.json(
      { message: error.response?.data?.detail || "Failed to verify 2FA code" },
      { status: error.response?.status || 500 },
    )
  }
}
