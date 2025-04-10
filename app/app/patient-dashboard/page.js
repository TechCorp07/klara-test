"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { healthcare } from "@/lib/services/healthcareService"
import { medication } from "@/lib/services/medicationService"
import { telemedicine } from "@/lib/services/telemedicineService"
import { wearables } from "@/lib/services/wearablesService"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { toast } from "react-toastify"

export default function PatientDashboard() {
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()

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

  // Fetch medications
  const { data: medications } = useQuery({
    queryKey: ["medications", user?.id],
    queryFn: () => medication.getMedications({ patient: user?.id }),
    enabled: !!user && mounted,
    onError: (error) => {
      if (mounted) {
        toast.error("Failed to load medications")
      }
      console.error("Error fetching medications:", error)
    },
  })

  // Fetch wearable data
  const { data: wearableData } = useQuery({
    queryKey: ["wearableData", user?.id],
    queryFn: () => wearables.getWearableData(user?.id, "all", null, null),
    enabled: !!user && mounted,
    onError: (error) => {
      console.error("Error fetching wearable data:", error)
      // Don't show error toast as this might be a normal state (no wearables connected)
    },
  })

  // Fetch medical records
  const { data: medicalRecords } = useQuery({
    queryKey: ["medicalRecords", user?.id],
    queryFn: () => healthcare.getMedicalRecords(user?.id),
    enabled: !!user && mounted,
    onError: (error) => {
      if (mounted) {
        toast.error("Failed to load medical records")
      }
      console.error("Error fetching medical records:", error)
    },
  })

  // Redirect if user is not a patient
  useEffect(() => {
    if (mounted && user && user.role !== "patient") {
      window.location.href = "/dashboard"
    }
  }, [user, mounted])

  // If not mounted yet, show a simple loading state
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Patient Dashboard</h1>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Patient Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.first_name || "Patient"}!</p>
      </div>

      {/* Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
            <Link href="/appointments" className="text-blue-600 hover:text-blue-800 text-sm">
              View all
            </Link>
          </div>

          {appointments && appointments.results && appointments.results.length > 0 ? (
            <div className="space-y-4">
              {appointments.results.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="border-b pb-3">
                  <p className="font-medium">
                    {new Date(appointment.scheduled_time).toLocaleDateString()} at{" "}
                    {new Date(appointment.scheduled_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {appointment.appointment_type} with Dr. {appointment.provider_name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No upcoming appointments.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Medications</h2>
            <Link href="/medications" className="text-blue-600 hover:text-blue-800 text-sm">
              View all
            </Link>
          </div>

          {medications && medications.results && medications.results.length > 0 ? (
            <div className="space-y-4">
              {medications.results.slice(0, 3).map((med) => (
                <div key={med.id} className="border-b pb-3">
                  <p className="font-medium">{med.name}</p>
                  <p className="text-sm text-gray-600">
                    {med.dosage} - {med.frequency}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No medications prescribed.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Health Metrics</h2>
            <Link href="/health-devices" className="text-blue-600 hover:text-blue-800 text-sm">
              View all
            </Link>
          </div>

          {wearableData && wearableData.results && wearableData.results.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(groupMetricsByType(wearableData.results || []))
                .slice(0, 3)
                .map(([type, metrics]) => {
                  const latestMetric = metrics[0]
                  return (
                    <div key={type} className="border-b pb-3">
                      <p className="font-medium">{formatMetricType(type)}</p>
                      <p className="text-sm text-gray-600">
                        {latestMetric.value} {latestMetric.unit} -{" "}
                        {new Date(latestMetric.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  )
                })}
            </div>
          ) : (
            <p className="text-gray-500">No health metrics available.</p>
          )}
        </div>
      </div>

      {/* Medical Records and Care Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Medical Records</h2>
            <Link href="/medical-records" className="text-blue-600 hover:text-blue-800 text-sm">
              View all
            </Link>
          </div>

          {medicalRecords && medicalRecords.results && medicalRecords.results.length > 0 ? (
            <div className="space-y-4">
              {medicalRecords.results.slice(0, 3).map((record) => (
                <div key={record.id} className="border-b pb-3">
                  <p className="font-medium">Record #{record.medical_record_number}</p>
                  <p className="text-sm text-gray-600">
                    Last updated: {new Date(record.updated_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No medical records available.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Care Plan</h2>
            <Link href="/care-plan" className="text-blue-600 hover:text-blue-800 text-sm">
              View details
            </Link>
          </div>

          <div className="space-y-4">
            <div className="border-b pb-3">
              <p className="font-medium">Daily Medication</p>
              <p className="text-sm text-gray-600">Take all prescribed medications as scheduled</p>
            </div>
            <div className="border-b pb-3">
              <p className="font-medium">Exercise</p>
              <p className="text-sm text-gray-600">30 minutes of moderate activity, 5 days per week</p>
            </div>
            <div className="border-b pb-3">
              <p className="font-medium">Diet</p>
              <p className="text-sm text-gray-600">Follow recommended nutrition plan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/appointments/new"
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-lg text-center"
          >
            <div className="flex flex-col items-center">
              <svg
                className="h-8 w-8 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Schedule Appointment</span>
            </div>
          </Link>

          <Link
            href="/messages/new"
            className="bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-lg text-center"
          >
            <div className="flex flex-col items-center">
              <svg
                className="h-8 w-8 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <span>Message Provider</span>
            </div>
          </Link>

          <Link
            href="/health-devices"
            className="bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-lg text-center"
          >
            <div className="flex flex-col items-center">
              <svg
                className="h-8 w-8 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
              <span>Connect Device</span>
            </div>
          </Link>

          <Link
            href="/medications/refill"
            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-4 rounded-lg text-center"
          >
            <div className="flex flex-col items-center">
              <svg
                className="h-8 w-8 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <span>Request Refill</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Community and Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Community</h2>
            <Link href="/community" className="text-blue-600 hover:text-blue-800 text-sm">
              Join discussions
            </Link>
          </div>

          <p className="text-gray-600 mb-4">Connect with others, share experiences, and learn from the community.</p>

          <div className="space-y-2">
            <Link href="/community/topics/support" className="block text-blue-600 hover:text-blue-800">
              → Support Groups
            </Link>
            <Link href="/community/topics/questions" className="block text-blue-600 hover:text-blue-800">
              → Questions & Answers
            </Link>
            <Link href="/community/topics/research" className="block text-blue-600 hover:text-blue-800">
              → Research & Studies
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Resources</h2>
            <Link href="/resources" className="text-blue-600 hover:text-blue-800 text-sm">
              View all
            </Link>
          </div>

          <p className="text-gray-600 mb-4">Educational materials and resources to help manage your health.</p>

          <div className="space-y-2">
            <Link href="/resources/articles" className="block text-blue-600 hover:text-blue-800">
              → Health Articles
            </Link>
            <Link href="/resources/videos" className="block text-blue-600 hover:text-blue-800">
              → Educational Videos
            </Link>
            <Link href="/resources/faq" className="block text-blue-600 hover:text-blue-800">
              → Frequently Asked Questions
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to group metrics by type
function groupMetricsByType(metrics) {
  if (!metrics || !Array.isArray(metrics)) return {}

  const grouped = {}

  metrics.forEach((metric) => {
    if (!grouped[metric.metric_type]) {
      grouped[metric.metric_type] = []
    }
    grouped[metric.metric_type].push(metric)
  })

  // Sort each group by timestamp (newest first)
  Object.keys(grouped).forEach((type) => {
    grouped[type].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  })

  return grouped
}

// Helper function to format metric type
function formatMetricType(type) {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
