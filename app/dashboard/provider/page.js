import ProviderClient from "./components/ProviderClient"
import { withRoleAccess } from "@/components/hoc/withRoleAccess"

/**
 * Server component for provider page
 * This serves as the entry point for the healthcare provider dashboard
 */
export default function Page() {
  const ProtectedProviderClient = withRoleAccess(ProviderClient, ["provider"])
  return <ProtectedProviderClient />
}
