"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  FaHome,
  FaCalendarAlt,
  FaFileMedical,
  FaComments,
  FaHospitalUser,
  FaPrescriptionBottleAlt,
  FaChartLine,
  FaUserLock,
  FaHeartbeat,
  FaCog,
  FaAngleRight,
  FaAngleDown,
} from "react-icons/fa"

// Define navigation for different user roles
const roleNavigation = {
  patient: [
    { name: "Dashboard", href: "/dashboard", icon: FaHome },
    { name: "Appointments", href: "/appointments", icon: FaCalendarAlt },
    { name: "Medical Records", href: "/medical-records", icon: FaFileMedical },
    { name: "Messages", href: "/messages", icon: FaComments },
    { name: "Prescriptions", href: "/prescriptions", icon: FaPrescriptionBottleAlt },
    { name: "Health Devices", href: "/health-devices", icon: FaHeartbeat },
  ],
  provider: [
    { name: "Dashboard", href: "/dashboard", icon: FaHome },
    { name: "Appointments", href: "/appointments", icon: FaCalendarAlt },
    { name: "Patients", href: "/patients", icon: FaHospitalUser },
    { name: "Messages", href: "/messages", icon: FaComments },
    { name: "Prescriptions", href: "/prescriptions", icon: FaPrescriptionBottleAlt },
    { name: "Analytics", href: "/analytics", icon: FaChartLine },
  ],
  pharmco: [
    { name: "Dashboard", href: "/dashboard", icon: FaHome },
    { name: "Prescriptions", href: "/prescriptions", icon: FaPrescriptionBottleAlt },
    { name: "Messages", href: "/messages", icon: FaComments },
    { name: "Analytics", href: "/analytics", icon: FaChartLine },
  ],
  insurer: [
    { name: "Dashboard", href: "/dashboard", icon: FaHome },
    { name: "Members", href: "/members", icon: FaHospitalUser },
    { name: "Claims", href: "/claims", icon: FaFileMedical },
    { name: "Messages", href: "/messages", icon: FaComments },
    { name: "Analytics", href: "/analytics", icon: FaChartLine },
  ],
  admin: [
    { name: "Dashboard", href: "/dashboard", icon: FaHome },
    { name: "Users", href: "/admin/users", icon: FaHospitalUser },
    { name: "Audit Logs", href: "/admin/audit", icon: FaUserLock },
    { name: "System Settings", href: "/admin/settings", icon: FaCog },
    { name: "Analytics", href: "/analytics", icon: FaChartLine },
  ],
}

const SubMenu = ({ item, pathname, isActive, onClick }) => {
  return (
    <div className="py-1">
      <button
        className={`w-full text-left group flex items-center py-2 px-3 text-sm rounded-md ${
          isActive ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
        onClick={onClick}
      >
        {item.icon && <item.icon className="mr-3 h-5 w-5" />}
        <span className="flex-1">{item.name}</span>
        {isActive ? <FaAngleDown className="h-4 w-4" /> : <FaAngleRight className="h-4 w-4" />}
      </button>

      {isActive && item.children && (
        <div className="ml-7 mt-1 space-y-1">
          {item.children.map((subItem) => (
            <Link
              key={subItem.name}
              href={subItem.href}
              className={`${
                pathname === subItem.href
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              } group flex items-center py-2 px-3 text-sm rounded-md`}
            >
              {subItem.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ user }) {
  const router = useRouter()
  const { pathname } = router
  const [navigation, setNavigation] = useState([])
  const [expandedMenu, setExpandedMenu] = useState(null)

  // Set navigation based on user role
  useEffect(() => {
    if (user && user.role) {
      // Get navigation for the user's role or fallback to patient
      const roleNav = roleNavigation[user.role] || roleNavigation.patient

      // Enhance navigation with submenu items
      const enhancedNav = roleNav.map((item) => {
        const hasSubmenu = item.children && item.children.length > 0

        if (item.name === "Medical Records") {
          return {
            ...item,
            hasSubmenu,
            children: [
              { name: "Overview", href: "/medical-records" },
              { name: "Medications", href: "/medical-records/medications" },
              { name: "Allergies", href: "/medical-records/allergies" },
              { name: "Conditions", href: "/medical-records/conditions" },
              { name: "Lab Results", href: "/medical-records/lab-results" },
            ],
          }
        }

        if (item.name === "Appointments") {
          return {
            ...item,
            hasSubmenu,
            children: [
              { name: "Upcoming", href: "/appointments" },
              { name: "Past", href: "/appointments/past" },
              { name: "Schedule New", href: "/appointments/new" },
            ],
          }
        }

        if (user.role === "provider" && item.name === "Patients") {
          return {
            ...item,
            hasSubmenu,
            children: [
              { name: "All Patients", href: "/patients" },
              { name: "Recent", href: "/patients/recent" },
              { name: "Add Patient", href: "/patients/add" },
            ],
          }
        }

        return item
      })

      setNavigation(enhancedNav)

      // Set initial expanded menu based on current path
      const currentMainMenu = enhancedNav.find(
        (item) =>
          pathname === item.href || (item.children && item.children.some((subItem) => pathname === subItem.href)),
      )

      if (currentMainMenu && currentMainMenu.hasSubmenu) {
        setExpandedMenu(currentMainMenu.name)
      }
    }
  }, [user, pathname])

  const toggleSubmenu = (itemName) => {
    setExpandedMenu(expandedMenu === itemName ? null : itemName)
  }

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-xl font-bold text-blue-600">Klararety</span>
            </div>

            <nav className="mt-5 flex-1 px-3 space-y-1">
              {navigation.map((item) =>
                item.hasSubmenu ? (
                  <SubMenu
                    key={item.name}
                    item={item}
                    pathname={pathname}
                    isActive={expandedMenu === item.name}
                    onClick={() => toggleSubmenu(item.name)}
                  />
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      pathname === item.href
                        ? "bg-blue-100 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    } group flex items-center py-2 px-3 text-sm rounded-md`}
                  >
                    {item.icon && <item.icon className="mr-3 h-5 w-5" />}
                    {item.name}
                  </Link>
                ),
              )}
            </nav>
          </div>

          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <Link href="/settings" className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <FaCog className="h-5 w-5 text-gray-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700 group-hover:text-gray-900">Settings</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
