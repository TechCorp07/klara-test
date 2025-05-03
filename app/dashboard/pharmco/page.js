"use client"

import PharmcoClient from "./components/PharmcoClient"
import { withRoleAccess } from "@/components/hoc/withRoleAccess"

/**
 * Server component for pharmco page
 * This serves as the entry point for the pharmaceutical dashboard
 */
export default function Page() {
  const ProtectedPharmcoClient = withRoleAccess(PharmcoClient, ["pharmco"])
  return <ProtectedPharmcoClient />
}
