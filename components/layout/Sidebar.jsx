"use client"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { APP_ROUTES } from "@/lib/config"

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()

  // Define navigation items based on user role
  const getNavigationItems = () => {
    if (!user) return []

    switch (user.role) {
      case "patient":
        return [
          { name: "Dashboard", href: APP_ROUTES.DASHBOARD.PATIENT, icon: "dashboard" },
          { name: "Appointments", href: APP_ROUTES.APPOINTMENTS, icon: "calendar" },
          { name: "Medical Records", href: APP_ROUTES.MEDICAL_RECORDS, icon: "folder" },
          { name: "Medications", href: APP_ROUTES.MEDICATIONS, icon: "pill" },
          { name: "Messages", href: APP_ROUTES.MESSAGES, icon: "message" },
          { name: "Health Tracking", href: APP_ROUTES.HEALTH_TRACKING, icon: "activity" },
          { name: "Community", href: APP_ROUTES.COMMUNITY.BASE, icon: "users" },
          { name: "Settings", href: APP_ROUTES.SETTINGS, icon: "settings" },
        ]
      case "provider":
        return [
          { name: "Dashboard", href: APP_ROUTES.DASHBOARD.PROVIDER, icon: "dashboard" },
          { name: "Patients", href: "/patients", icon: "users" },
          { name: "Appointments", href: APP_ROUTES.APPOINTMENTS, icon: "calendar" },
          { name: "Telemedicine", href: APP_ROUTES.TELEMEDICINE, icon: "video" },
          { name: "EHR", href: APP_ROUTES.EHR.PATIENT_VIEWER, icon: "folder" },
          { name: "Messages", href: APP_ROUTES.MESSAGES, icon: "message" },
          { name: "Settings", href: APP_ROUTES.SETTINGS, icon: "settings" },
        ]
      case "admin":
        return [
          { name: "Dashboard", href: APP_ROUTES.DASHBOARD.ADMIN, icon: "dashboard" },
          { name: "Users", href: "/admin-dashboard/users", icon: "users" },
          { name: "Approvals", href: "/admin-dashboard/approvals", icon: "check-circle" },
          { name: "Alerts", href: "/admin-dashboard/alerts", icon: "alert-circle" },
          { name: "Settings", href: APP_ROUTES.SETTINGS, icon: "settings" },
        ]
      case "compliance":
        return [
          { name: "Dashboard", href: APP_ROUTES.DASHBOARD.COMPLIANCE, icon: "dashboard" },
          { name: "Audit Log", href: "/compliance-dashboard/audit-log", icon: "list" },
          { name: "Reports", href: "/compliance-dashboard/reports", icon: "file-text" },
          { name: "Settings", href: APP_ROUTES.SETTINGS, icon: "settings" },
        ]
      case "caregiver":
        return [
          { name: "Dashboard", href: APP_ROUTES.DASHBOARD.CAREGIVER, icon: "dashboard" },
          { name: "Patients", href: "/patients", icon: "users" },
          { name: "Medications", href: APP_ROUTES.MEDICATIONS, icon: "pill" },
          { name: "Appointments", href: APP_ROUTES.APPOINTMENTS, icon: "calendar" },
          { name: "Messages", href: APP_ROUTES.MESSAGES, icon: "message" },
          { name: "Settings", href: APP_ROUTES.SETTINGS, icon: "settings" },
        ]
      case "pharmco":
        return [
          { name: "Dashboard", href: APP_ROUTES.DASHBOARD.PHARMCO, icon: "dashboard" },
          { name: "Medications", href: "/medications-management", icon: "pill" },
          { name: "Patients", href: "/patient-data", icon: "users" },
          { name: "Reports", href: "/medication-reports", icon: "bar-chart" },
          { name: "Settings", href: APP_ROUTES.SETTINGS, icon: "settings" },
        ]
      case "researcher":
        return [
          { name: "Dashboard", href: APP_ROUTES.DASHBOARD.RESEARCHER, icon: "dashboard" },
          { name: "Studies", href: "/research/studies", icon: "clipboard" },
          { name: "Participants", href: "/research/participants", icon: "users" },
          { name: "Data", href: "/research/data", icon: "database" },
          { name: "Reports", href: "/research/reports", icon: "bar-chart" },
          { name: "Settings", href: APP_ROUTES.SETTINGS, icon: "settings" },
        ]
      case "superadmin":
        return [
          { name: "Dashboard", href: APP_ROUTES.DASHBOARD.SUPERADMIN, icon: "dashboard" },
          { name: "Security", href: "/superadmin-dashboard/security", icon: "shield" },
          { name: "Compliance", href: "/superadmin-dashboard/security/compliance", icon: "check-square" },
          { name: "Vulnerabilities", href: "/superadmin-dashboard/security/vulnerabilities", icon: "alert-triangle" },
          { name: "System", href: "/superadmin-dashboard/system", icon: "server" },
          { name: "Settings", href: APP_ROUTES.SETTINGS, icon: "settings" },
        ]
      default:
        return []
    }
  }

  const navigationItems = getNavigationItems()

  // If no user or navigation items, don't render the sidebar
  if (!user || navigationItems.length === 0) {
    return null
  }

  return (
    <aside className="bg-white w-64 min-h-screen shadow-md hidden md:block">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800">Klararety Health</h2>
        <p className="text-sm text-gray-600">{user.role.charAt(0).toUpperCase() + user.role.slice(1)} Portal</p>
      </div>
      <nav className="mt-6">
        <ul>
          {navigationItems.map((item) => (
            <li key={item.name} className="px-4 py-2">
              <Link
                href={item.href}
                className={`flex items-center space-x-2 ${
                  pathname === item.href ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <span className="material-icons-outlined text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
