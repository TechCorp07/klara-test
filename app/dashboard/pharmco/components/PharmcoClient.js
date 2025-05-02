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
 * Pharmaceutical company dashboard client component
 * Displays pharmaceutical-specific information and actions
 */
const PharmcoClient = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [medications, setMedications] = useState([])
  const [stats, setStats] = useState({
    totalMedications: 0,
    pendingApprovals: 0,
    activePrescriptions: 0,
    adherenceRate: 0,
  })

  useEffect(() => {
    const fetchPharmcoData = async () => {
      try {
        setLoading(true)

        // Fetch medications managed by this pharmaceutical company
        const medicationsResponse = await apiClient.request("GET", "/pharmco/medications", null, {
          errorMessage: "Failed to fetch medications",
        })

        // Fetch pharmaceutical company stats
        const statsResponse = await apiClient.request("GET", "/pharmco/stats", null, {
          errorMessage: "Failed to fetch pharmaceutical stats",
        })

        setMedications(medicationsResponse.data || [])
        setStats(
          statsResponse.data || {
            totalMedications: 0,
            pendingApprovals: 0,
            activePrescriptions: 0,
            adherenceRate: 0,
          },
        )

        setLoading(false)
      } catch (err) {
        console.error("Error fetching pharmaceutical data:", err)
        setError(err.message || "Failed to load pharmaceutical dashboard")
        setLoading(false)
      }
    }

    fetchPharmcoData()
  }, [user?.id])

  if (loading) return <LoadingComponent />
  if (error) return <ErrorComponent message={error} />

  return (
    <DashboardLayout title="Pharmaceutical Dashboard" subtitle={`Welcome, ${user?.firstName || "User"}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Medications" value={stats.totalMedications} icon="pill" trend={null} />
        <StatsCard title="Pending Approvals" value={stats.pendingApprovals} icon="clipboard-list" trend={null} />
        <StatsCard title="Active Prescriptions" value={stats.activePrescriptions} icon="file-text" trend={null} />
        <StatsCard title="Adherence Rate" value={`${stats.adherenceRate}%`} icon="check-circle" trend={null} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataPanel
            title="Managed Medications"
            data={medications}
            emptyMessage="No medications found"
            renderItem={(medication) => (
              <div key={medication.id} className="p-4 border-b flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{medication.name}</h3>
                  <p className="text-sm text-gray-500">
                    {medication.dosage} • {medication.form} • {medication.status}
                  </p>
                </div>
                <button className="text-blue-600 hover:text-blue-800">View Details</button>
              </div>
            )}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <QuickActionButton icon="plus-circle" label="Add New Medication" onClick={() => {}} />
            <QuickActionButton icon="clipboard" label="Review Approvals" onClick={() => {}} />
            <QuickActionButton icon="bar-chart-2" label="View Analytics" onClick={() => {}} />
            <QuickActionButton icon="alert-triangle" label="Report Adverse Event" onClick={() => {}} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default PharmcoClient
