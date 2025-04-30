"use client"
import { useAuth } from "@/contexts/AuthContext"

/**
 * DashboardLayout component that provides a consistent layout for all dashboard pages
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Dashboard content
 * @param {string} props.title - Dashboard title
 * @param {string} props.subtitle - Optional subtitle or welcome message
 * @param {string} props.role - User role for role-specific customization
 */
const DashboardLayout = ({ children, title, subtitle, role = "user" }) => {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-600">{subtitle || `Welcome back, ${user?.first_name || user?.last_name || role}!`}</p>
      </div>

      {children}
    </div>
  )
}

export default DashboardLayout
