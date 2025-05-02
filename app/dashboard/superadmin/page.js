import SuperadminClient from "./components/SuperadminClient"
import { withRoleAccess } from "@/components/hoc/withRoleAccess"

/**
 * Server component for superadmin dashboard page
 * This serves as the entry point for the superadmin dashboard
 */
export default function Page() {
  const ProtectedSuperadminClient = withRoleAccess(SuperadminClient, ["superadmin"])
  return <ProtectedSuperadminClient />
}
