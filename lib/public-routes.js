/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/request-verification",
  "/maintenance",
  "/",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms-of-service",
]

/**
 * Check if a route is public
 * @param {string} pathname - The current pathname
 * @returns {boolean} - True if the route is public
 */
export const isPublicRoute = (pathname) => {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}
