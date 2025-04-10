"use server"

import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { token, code } = await request.json()

    // Call backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/verify-2fa/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, code }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    const { access, refresh, user } = data

    // Set cookies
    const responseObj = NextResponse.json({
      success: true,
      user,
    })

    // Set HttpOnly cookies
    responseObj.cookies.set("access_token", access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 15, // 15 minutes
      path: "/",
    })

    responseObj.cookies.set("refresh_token", refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return responseObj
  } catch (error) {
    console.error("2FA verification error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
