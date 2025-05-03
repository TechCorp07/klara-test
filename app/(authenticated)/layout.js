import Header from "@/components/layout/Header"
import Sidebar from "@/components/layout/Sidebar"
import MobileNavigation from "@/components/layout/MobileNavigation"

/**
 * Layout for authenticated pages
 * Includes the header, sidebar, and mobile navigation
 */
export default function AuthenticatedLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 p-4 pb-16 md:pb-4">{children}</main>
        <MobileNavigation />
      </div>
    </div>
  )
}
