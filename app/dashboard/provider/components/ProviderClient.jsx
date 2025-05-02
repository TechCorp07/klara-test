"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import DashboardLayout from "@/components/dashboard/DashboardLayout"
import { toast } from "react-toastify"

export default function ProviderClient() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [patientData, setPatientData] = useState([])
  const [appointments, setAppointments] = useState([])
  const [messages, setMessages] = useState([])
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    unreadMessages: 0,
    pendingPrescriptions: 0,
  })

  useEffect(() => {
    // Simulate fetching provider-specific data
    const fetchProviderData = async () => {
      try {
        // This would be replaced with actual API calls
        setTimeout(() => {
          setStats({
            totalPatients: 124,
            todayAppointments: 8,
            unreadMessages: 5,
            pendingPrescriptions: 3,
          })

          setPatientData([
            {
              id: 1,
              name: "John Smith",
              age: 45,
              lastVisit: "2023-04-01",
              conditions: ["Hypertension", "Type 2 Diabetes"],
            },
            { id: 2, name: "Emily Johnson", age: 32, lastVisit: "2023-04-05", conditions: ["Asthma"] },
            { id: 3, name: "Robert Brown", age: 67, lastVisit: "2023-03-15", conditions: ["Arthritis", "COPD"] },
            { id: 4, name: "Sarah Wilson", age: 29, lastVisit: "2023-04-10", conditions: ["Anxiety"] },
            {
              id: 5,
              name: "Michael Davis",
              age: 54,
              lastVisit: "2023-03-28",
              conditions: ["Hypertension", "High Cholesterol"],
            },
          ])

          setAppointments([
            { id: 101, patient: "John Smith", time: "9:00 AM", type: "Follow-up", status: "Confirmed" },
            { id: 102, patient: "Lisa Chen", time: "10:30 AM", type: "Initial Consultation", status: "Confirmed" },
            { id: 103, patient: "Robert Brown", time: "1:15 PM", type: "Test Results", status: "Pending" },
            { id: 104, patient: "Amanda White", time: "2:45 PM", type: "Follow-up", status: "Confirmed" },
            { id: 105, patient: "David Miller", time: "4:00 PM", type: "Medication Review", status: "Confirmed" },
          ])

          setMessages([
            { id: 201, from: "John Smith", subject: "Medication Question", time: "8:15 AM", read: false },
            { id: 202, from: "Pharmacy Services", subject: "Prescription Renewal", time: "Yesterday", read: false },
            { id: 203, from: "Emily Johnson", subject: "Test Results", time: "Yesterday", read: false },
            { id: 204, from: "Admin Staff", subject: "Schedule Update", time: "Apr 10", read: true },
            { id: 205, from: "Robert Brown", subject: "Appointment Follow-up", time: "Apr 9", read: true },
          ])

          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching provider data:", error)
        toast.error("Failed to load provider dashboard data")
        setLoading(false)
      }
    }

    fetchProviderData()
  }, [])

  if (loading) {
    return (
      <DashboardLayout
        title="Provider Dashboard"
        subtitle="Loading your patient data and appointments..."
        role="provider"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Provider Dashboard"
      subtitle={`Welcome back, Dr. ${user?.last_name || "Provider"}!`}
      role="provider"
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Patients</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.totalPatients}</p>
          <div className="mt-2">
            <a href="/patients" className="text-primary-600 hover:underline text-sm">
              View all patients
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium">Today's Appointments</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.todayAppointments}</p>
          <div className="mt-2">
            <a href="/appointments" className="text-primary-600 hover:underline text-sm">
              View schedule
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium">Unread Messages</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.unreadMessages}</p>
          <div className="mt-2">
            <a href="/messages" className="text-primary-600 hover:underline text-sm">
              Check inbox
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-500 text-sm font-medium">Pending Prescriptions</h3>
          <p className="text-3xl font-bold text-gray-800">{stats.pendingPrescriptions}</p>
          <div className="mt-2">
            <a href="/prescriptions" className="text-primary-600 hover:underline text-sm">
              Review requests
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Today's Appointments</h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {appointment.patient}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appointment.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.status === "Confirmed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-right">
              <a
                href="/appointments"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                View All Appointments
              </a>
            </div>
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Recent Messages</h2>
          </div>
          <div className="p-6">
            <ul className="divide-y divide-gray-200">
              {messages.map((message) => (
                <li key={message.id} className="py-3">
                  <div className="flex items-center">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${message.read ? "text-gray-600" : "text-gray-900"}`}>
                        {message.from}
                        {!message.read && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            New
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{message.subject}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <p className="text-sm text-gray-500">{message.time}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 text-right">
              <a
                href="/messages"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                View All Messages
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Patients */}
      <div className="mt-6 bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Recent Patients</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conditions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patientData.map((patient) => (
                  <tr key={patient.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.age}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.lastVisit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {patient.conditions.map((condition, idx) => (
                          <span
                            key={idx}
                            className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
                          >
                            {condition}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <a href={`/patients/${patient.id}`} className="text-primary-600 hover:text-primary-900 mr-3">
                        View
                      </a>
                      <a href={`/patients/${patient.id}/chart`} className="text-primary-600 hover:text-primary-900">
                        Chart
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-right">
            <a
              href="/patients"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              All Patients
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
