"use server"

import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request) {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get("access_token")?.value

    // Call backend API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    // Create response object
    const responseObj = NextResponse.json({
      success: true,
    })

    // Clear cookies regardless of API response
    responseObj.cookies.delete("access_token")
    responseObj.cookies.delete("refresh_token")

    return responseObj
  } catch (error) {
    console.error("Logout error:", error)

    // Even if there's an error, we should clear cookies
    const responseObj = NextResponse.json({ message: "Logout completed with errors" }, { status: 500 })

    responseObj.cookies.delete("access_token")
    responseObj.cookies.delete("refresh_token")

    return responseObj
  }
}
