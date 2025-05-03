/**
 * Role-based route patterns
 * Maps user roles to the route patterns they can access
 */
export const ROLE_ROUTE_PATTERNS = {
  patient: [
    "/dashboard/patient",
    "/appointments",
    "/medical-records",
    "/medications",
    "/messages",
    "/health-tracking",
    "/community",
    "/patient-dashboard",
    "/settings",
  ],
  provider: ["/dashboard/provider", "/patients", "/appointments", "/telemedicine", "/ehr", "/messages", "/settings"],
  admin: ["/dashboard/admin", "/admin-dashboard", "/settings"],
  compliance: ["/dashboard/compliance", "/compliance-dashboard", "/settings"],
  caregiver: ["/dashboard/caregiver", "/patients", "/medications", "/appointments", "/messages", "/settings"],
  pharmco: ["/dashboard/pharmco", "/medications-management", "/patient-data", "/medication-reports", "/settings"],
  researcher: ["/dashboard/researcher", "/research", "/settings"],
  superadmin: ["/dashboard/superadmin", "/superadmin-dashboard", "/settings"],
}

/**
 * Check if a user has access to a route based on their role
 * @param {string} role - The user's role
 * @param {string} pathname - The current pathname
 * @returns {boolean} - True if the user has access to the route
 */
export const hasRoleAccess = (role, pathname) => {
  if (!role || !pathname) return false

  // If the role doesn't exist in our patterns, deny access
  if (!ROLE_ROUTE_PATTERNS[role]) return false

  // Check if the pathname starts with any of the allowed patterns for this role
  return ROLE_ROUTE_PATTERNS[role].some((pattern) => pathname.startsWith(pattern))
}

/**
 * Get the dashboard route for a user role
 * @param {string} role - The user's role
 * @returns {string} - The dashboard route for the role
 */
export const getDashboardRoute = (role) => {
  switch (role) {
    case "patient":
      return "/dashboard/patient"
    case "provider":
      return "/dashboard/provider"
    case "admin":
      return "/dashboard/admin"
    case "compliance":
      return "/dashboard/compliance"
    case "caregiver":
      return "/dashboard/caregiver"
    case "pharmco":
      return "/dashboard/pharmco"
    case "researcher":
      return "/dashboard/researcher"
    case "superadmin":
      return "/dashboard/superadmin"
    default:
      return "/dashboard"
  }
}
