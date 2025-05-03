"use client"

import CaregiverClient from "./components/CaregiverClient"
import { withRoleAccess } from "@/components/hoc/withRoleAccess"

/**
 * Server component for caregiver page
 * This serves as the entry point for the caregiver dashboard
 */
export default function Page() {
  const ProtectedCaregiverClient = withRoleAccess(CaregiverClient, ["caregiver"])
  return <ProtectedCaregiverClient />
}
