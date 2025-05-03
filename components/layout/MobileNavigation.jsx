"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Home, Calendar, Pill, MessageSquare, Activity, Users, Settings } from "lucide-react"

export default function MobileNavigation() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [navItems, setNavItems] = useState([])

  useEffect(() => {
    if (!user) return

    // Define navigation items based on user role
    switch (user.role) {
      case "patient":
        setNavItems([
          { name: "Home", href: "/dashboard/patient", icon: Home },
          { name: "Appointments", href: "/appointments", icon: Calendar },
          { name: "Medications", href: "/medications", icon: Pill },
          { name: "Messages", href: "/messages", icon: MessageSquare },
          { name: "Health", href: "/health-tracking", icon: Activity },
        ])
        break
      case "provider":
        setNavItems([
          { name: "Home", href: "/dashboard/provider", icon: Home },
          { name: "Patients", href: "/patients", icon: Users },
          { name: "Appointments", href: "/appointments", icon: Calendar },
          { name: "Messages", href: "/messages", icon: MessageSquare },
          { name: "Settings", href: "/settings", icon: Settings },
        ])
        break
      // Add cases for other roles as needed
      default:
        setNavItems([
          { name: "Home", href: "/dashboard", icon: Home },
          { name: "Settings", href: "/settings", icon: Settings },
        ])
    }
  }, [user])

  if (!user || navItems.length === 0) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-10">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 ${
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
