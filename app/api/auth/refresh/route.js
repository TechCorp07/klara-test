// app/api/auth/refresh/route.js
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * Token refresh endpoint - refreshes access token
 * @route POST auth/refresh
 */
export async function POST(request) {
  try {
    const cookieStore = cookies()
    const refreshToken = cookieStore.get("refresh_token")?.value

    if (!refreshToken) {
      return NextResponse.json({ message: "Refresh token not found" }, { status: 401 })
    }

    // Call backend API
    const response = await fetch(`${API_URL}/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    if (!response.ok) {
      // If refresh token is invalid, clear all cookies
      if (response.status === 401) {
        const responseObj = NextResponse.json({ message: "Invalid refresh token" }, { status: 401 })

        responseObj.cookies.delete("access_token")
        responseObj.cookies.delete("refresh_token")

        return responseObj
      }

      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    const { access } = data

    // Set cookies
    const responseObj = NextResponse.json({
      success: true,
    })

    // Set HttpOnly cookie for access token
    responseObj.cookies.set("access_token", access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 15, // 15 minutes
      path: "/",
    })

    return responseObj
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
