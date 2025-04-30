"use client"
import { useAuth } from "@/contexts/AuthContext"

/**
 * AuthenticatedLayout component that provides a layout for authenticated pages
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.title - Page title
 */
const AuthenticatedLayout = ({ children, title }) => {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        {user && (
          <p className="text-gray-600">
            Welcome, {user.first_name} {user.last_name}
          </p>
        )}
      </div>

      {children}
    </div>
  )
}

export default AuthenticatedLayout
