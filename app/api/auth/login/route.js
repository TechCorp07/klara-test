// /api/auth/login.js
import { NextResponse } from "next/server"
import authAPI from "@/api/auth"
import { cookies } from "next/headers"

/**
 * API route handler for user login
 *
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} - The response object
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ message: "Username and password are required" }, { status: 400 })
    }

    // Call the auth API to login
    const response = await authAPI.login({ username, password })

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

    // Check if 2FA is required
    if (response.requires_2fa) {
      return NextResponse.json(
        {
          requires2FA: true,
          token: response.temp_token,
        },
        { status: 200 },
      )
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
    console.error("Login error:", error)

    return NextResponse.json(
      { message: error.response?.data?.detail || "Login failed" },
      { status: error.response?.status || 500 },
    )
  }
}
