import DashboardClient from "./components/DashboardClient"
import { withRoleAccess } from "@/components/hoc/withRoleAccess"

/**
 * Server component for compliance dashboard page
 * This serves as the entry point for the compliance dashboard
 */
export default function Page() {
  const ProtectedDashboardClient = withRoleAccess(DashboardClient, ["compliance"])
  return <ProtectedDashboardClient />
}
