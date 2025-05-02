"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/api/client"
import LoadingComponent from "@/components/ui/LoadingComponent"
import ErrorComponent from "@/components/ui/ErrorComponent"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import StatsCard from "@/components/dashboard/StatsCard"
import DataPanel from "@/components/dashboard/DataPanel"
import QuickActionButton from "@/components/dashboard/QuickActionButton"

/**
 * Caregiver dashboard client component
 * Displays caregiver-specific information and actions
 */
const CaregiverClient = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [patients, setPatients] = useState([])
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    pendingTasks: 0,
    upcomingAppointments: 0,
  })

  useEffect(() => {
    const fetchCaregiverData = async () => {
      try {
        setLoading(true)

        // Fetch patients under caregiver's care
        const patientsResponse = await apiClient.request("GET", "/caregivers/patients", null, {
          errorMessage: "Failed to fetch patients",
        })

        // Fetch caregiver stats
        const statsResponse = await apiClient.request("GET", "/caregivers/stats", null, {
          errorMessage: "Failed to fetch caregiver stats",
        })

        setPatients(patientsResponse.data || [])
        setStats(
          statsResponse.data || {
            totalPatients: 0,
            activePatients: 0,
            pendingTasks: 0,
            upcomingAppointments: 0,
          },
        )

        setLoading(false)
      } catch (err) {
        console.error("Error fetching caregiver data:", err)
        setError(err.message || "Failed to load caregiver dashboard")
        setLoading(false)
      }
    }

    fetchCaregiverData()
  }, [user?.id])

  if (loading) return <LoadingComponent />
  if (error) return <ErrorComponent message={error} />

  return (
    <DashboardLayout title="Caregiver Dashboard" subtitle={`Welcome, ${user?.firstName || "Caregiver"}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Patients" value={stats.totalPatients} icon="users" trend={null} />
        <StatsCard title="Active Patients" value={stats.activePatients} icon="user-check" trend={null} />
        <StatsCard title="Pending Tasks" value={stats.pendingTasks} icon="clipboard-list" trend={null} />
        <StatsCard title="Upcoming Appointments" value={stats.upcomingAppointments} icon="calendar" trend={null} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataPanel
            title="Patients Under Your Care"
            data={patients}
            emptyMessage="No patients assigned yet"
            renderItem={(patient) => (
              <div key={patient.id} className="p-4 border-b flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    {patient.firstName} {patient.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">Last check-in: {patient.lastCheckIn || "Never"}</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800">View Details</button>
              </div>
            )}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <QuickActionButton icon="clipboard-check" label="Record Patient Check-in" onClick={() => {}} />
            <QuickActionButton icon="pill" label="Medication Reminder" onClick={() => {}} />
            <QuickActionButton icon="calendar-plus" label="Schedule Appointment" onClick={() => {}} />
            <QuickActionButton icon="alert-circle" label="Report Issue" onClick={() => {}} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default CaregiverClient
