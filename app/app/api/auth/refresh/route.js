"use server"

import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { refresh } = await request.json()

    // Call backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
    })

    if (!response.ok) {
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
