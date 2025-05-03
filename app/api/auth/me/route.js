// /api/auth/me.js
export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import authAPI from "@/api/auth"
import { cookies } from "next/headers"

/**
 * API route handler for getting current user
 *
 * @param {Request} request - The incoming request object
 * @returns {NextResponse} - The response object
 */
export async function GET(request) {
  try {
    // Check if user is authenticated by checking cookies
    const cookieStore = cookies()
    const accessToken = cookieStore.get("access_token")

    if (!accessToken) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    // Call the auth API to get current user
    const response = await authAPI.getCurrentUser()

    // Return user data without sensitive information
    return NextResponse.json(
      {
        user: {
          id: response.id,
          username: response.username,
          email: response.email,
          first_name: response.first_name,
          last_name: response.last_name,
          role: response.role,
          two_factor_enabled: response.two_factor_enabled,
          profile_image: response.profile_image,
          data_sharing_consent: response.data_sharing_consent,
          medication_adherence_monitoring_consent: response.medication_adherence_monitoring_consent,
          vitals_monitoring_consent: response.vitals_monitoring_consent,
          research_consent: response.research_consent,
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Get current user error:", error)

    return NextResponse.json(
      { message: error.response?.data?.detail || "Failed to get user information" },
      { status: error.response?.status || 500 },
    )
  }
}
