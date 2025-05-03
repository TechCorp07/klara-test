"use client"

import { ToastContainer } from "react-toastify"
import { AuthProvider } from "@/contexts/AuthContext"
import { ApiProvider } from "@/contexts/ApiContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import "react-toastify/dist/ReactToastify.css"

/**
 * Global providers for the application
 */
export function Providers({ children }) {
  return (
    <ApiProvider>
      <AuthProvider>
        <NotificationProvider>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </NotificationProvider>
      </AuthProvider>
    </ApiProvider>
  )
}

export default Providers
