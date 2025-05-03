"use client"
import { useAuth } from "@/contexts/AuthContext"
import EmailVerificationStatus from "@/components/auth/EmailVerificationStatus"

export default function RequestVerificationClient() {
  const auth = useAuth() // don't destructure directly
  const user = auth?.user // safely check if exists

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Request Email Verification</h1>
        <p>Loading user info...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Request Email Verification</h1>
      <EmailVerificationStatus />
    </div>
  )
}
