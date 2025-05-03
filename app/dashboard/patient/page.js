"use client"

import PatientDashboard from "./components/PatientDashboard"
import { withRoleAccess } from "@/components/hoc/withRoleAccess"

/**
 * Server component for patient dashboard page
 * This serves as the entry point for the patient dashboard
 */
export default function Page() {
  const ProtectedPatientDashboard = withRoleAccess(PatientDashboard, ["patient"])
  return <ProtectedPatientDashboard />
}
