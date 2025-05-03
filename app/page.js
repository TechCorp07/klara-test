import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default function Home() {
  // Check if user is already logged in
  const cookieStore = cookies()
  const accessToken = cookieStore.get("access_token")

  // If user is already logged in, redirect to dashboard, otherwise to login
  if (accessToken) {
    redirect("/dashboard")
  } else {
    redirect("/auth/login")
  }
}
