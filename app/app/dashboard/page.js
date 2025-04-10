"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useQuery } from "@tanstack/react-query"
import { healthcare } from "@/lib/services/healthcareService"
import { telemedicine } from "@/lib/services/telemedicineService"
import { toast } from "react-toastify"

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    pendingMessages: 0,
    medicationReminders: 0,
    recentVitals: [],
  })

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch upcoming appointments
  const { data: appointments } = useQuery({
    queryKey: ["upcomingAppointments"],
    queryFn: () => telemedicine.getUpcomingAppointments(),
    enabled: !!user && mounted,
    onError: (error) => {
      if (mounted) {
        toast.error("Failed to load upcoming appointments")
      }
      console.error("Error fetching appointments:", error)
    },
  })

  // Fetch medical records if user is a patient
  const { data: medicalRecords } = useQuery({
    queryKey: ["medicalRecords", user?.id],
    queryFn: () => healthcare.getMedicalRecords(user?.id),
    enabled: !!user && user.role === "patient" && mounted,
    onError: (error) => {
      if (mounted) {
        toast.error("Failed to load medical records")
      }
      console.error("Error fetching medical records:", error)
    },
  })

  // Update dashboard stats when data is loaded
  useEffect(() => {
    if (mounted && appointments) {
      setStats((prev) => ({
        ...prev,
        upcomingAppointments: appointments.results?.length || 0,
      }))
    }
  }, [appointments, mounted])

  // Don't render anything during SSR
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Welcome message */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Welcome, {user?.first_name || "User"}!</h2>
        <p className="text-gray-600">Here's your health summary and upcoming activities.</p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Upcoming Appointments</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.upcomingAppointments}</p>
          <button onClick={() => router.push("/appointments")} className="mt-4 text-blue-600 hover:text-blue-800">
            View all appointments →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Pending Messages</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.pendingMessages}</p>
          <button onClick={() => router.push("/messages")} className="mt-4 text-blue-600 hover:text-blue-800">
            View all messages →
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Medication Reminders</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.medicationReminders}</p>
          <button onClick={() => router.push("/medications")} className="mt-4 text-blue-600 hover:text-blue-800">
            View medications →
          </button>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        {appointments && appointments.results && appointments.results.length > 0 ? (
          <div className="space-y-4">
            {appointments.results.slice(0, 3).map((appointment) => (
              <div key={appointment.id} className="border-b pb-4">
                <p className="font-medium">{new Date(appointment.scheduled_time).toLocaleString()}</p>
                <p className="text-gray-600">
                  {appointment.appointment_type} with Dr. {appointment.provider_name}
                </p>
                <p className="text-sm text-gray-500">{appointment.reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No recent activity to display.</p>
        )}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => router.push("/appointments/new")}
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-4 px-6 rounded-lg text-center"
          >
            Schedule Appointment
          </button>
          <button
            onClick={() => router.push("/messages/new")}
            className="bg-green-100 hover:bg-green-200 text-green-800 py-4 px-6 rounded-lg text-center"
          >
            Send Message
          </button>
          <button
            onClick={() => router.push("/medical-records")}
            className="bg-purple-100 hover:bg-purple-200 text-purple-800 py-4 px-6 rounded-lg text-center"
          >
            View Medical Records
          </button>
          <button
            onClick={() => router.push("/health-devices")}
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-4 px-6 rounded-lg text-center"
          >
            Connect Health Device
          </button>
        </div>
      </div>
    </div>
  )
}
