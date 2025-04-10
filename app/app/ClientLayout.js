"use client"

import { useState, useEffect } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/queryClient"
import { ToastContainer } from "react-toastify"
import { AuthProvider } from "../contexts/AuthContext"
import ErrorBoundary from "../components/auth/ErrorBoundary"
import "react-toastify/dist/ReactToastify.css"

export default function ClientLayout({ children }) {
  // Add any client-side only logic here
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ErrorBoundary>
          {mounted ? children : null}
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
        </ErrorBoundary>
      </AuthProvider>
    </QueryClientProvider>
  )
}
