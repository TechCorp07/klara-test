import { Inter } from "next/font/google"
import "../styles/globals.css"
import ClientLayout from "./ClientLayout"
import { AuthProvider } from "../contexts/AuthContext"

export const metadata = {
  title: "Klararety Health Platform",
  description: "Secure healthcare platform for patients and providers",
  keywords: "healthcare, telemedicine, medical records, HIPAA compliant",
    generator: 'v0.dev'
}

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  )
}


import './globals.css'