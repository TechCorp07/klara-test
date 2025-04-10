"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { healthcare } from "../../lib/api"
import AuthenticatedLayout from "../../components/layout/AuthenticatedLayout"

export default function PatientProfilePage() {
  const { user } = useAuth()
  const [patientId, setPatientId] = useState(null)
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Get patient ID from URL
  useEffect(() => {
    const pathParts = window.location.pathname.split("/")
    const id = pathParts[pathParts.length - 1]
    if (id && id !== "patient-profile") {
      setPatientId(id)
    }
  }, [])

  // Fetch patient data
  useEffect(() => {
    if (!patientId || !user) return

    const fetchPatientData = async () => {
      try {
        setLoading(true)
        const data = await healthcare.getPatientById(patientId)
        setPatient(data)
      } catch (err) {
        console.error("Error fetching patient data:", err)
        setError("Failed to load patient information. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchPatientData()
  }, [patientId, user])

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  // Check if user has permission to view patient data
  const hasPermission =
    user.role === "provider" ||
    user.role === "admin" ||
    user.role === "superadmin" ||
    (user.role === "caregiver" && user.patients?.includes(patientId))

  if (!hasPermission) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">You do not have permission to view this patient's information.</span>
          </div>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : patient ? (
          <div>
            {/* Patient Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center">
                  <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl">
                    {patient.first_name.charAt(0)}
                    {patient.last_name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h1 className="text-2xl font-bold">
                      {patient.first_name} {patient.last_name}
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:space-x-4 text-gray-600">
                      <span>ID: {patient.id}</span>
                      <span>DOB: {new Date(patient.date_of_birth).toLocaleDateString()}</span>
                      <span>Gender: {patient.gender}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex space-x-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Schedule Appointment
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Send Message
                  </button>
                </div>
              </div>

              {/* Alert Banners */}
              {patient.allergies && patient.allergies.length > 0 && (
                <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        <span className="font-medium">Allergies:</span> {patient.allergies.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "overview"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("medical_history")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "medical_history"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Medical History
                </button>
                <button
                  onClick={() => setActiveTab("medications")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "medications"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Medications
                </button>
                <button
                  onClick={() => setActiveTab("lab_results")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "lab_results"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Lab Results
                </button>
                <button
                  onClick={() => setActiveTab("wearable_data")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "wearable_data"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Wearable Data
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {activeTab === "overview" && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Patient Overview</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2">
                          <span className="text-gray-500">Full Name</span>
                          <span>
                            {patient.first_name} {patient.last_name}
                          </span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-500">Date of Birth</span>
                          <span>{new Date(patient.date_of_birth).toLocaleDateString()}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-500">Gender</span>
                          <span>{patient.gender}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-500">Blood Type</span>
                          <span>{patient.blood_type || "Not recorded"}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-500">Height</span>
                          <span>{patient.height ? `${patient.height} cm` : "Not recorded"}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-500">Weight</span>
                          <span>{patient.weight ? `${patient.weight} kg` : "Not recorded"}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2">
                          <span className="text-gray-500">Email</span>
                          <span>{patient.email}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-500">Phone</span>
                          <span>{patient.phone || "Not provided"}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-500">Address</span>
                          <span>{patient.address || "Not provided"}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-500">Emergency Contact</span>
                          <span>{patient.emergency_contact || "Not provided"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Recent Vitals</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-600 font-medium">Blood Pressure</div>
                        <div className="text-2xl font-bold">{patient.vitals?.blood_pressure || "N/A"}</div>
                        <div className="text-xs text-gray-500">
                          Last recorded:{" "}
                          {patient.vitals?.recorded_at
                            ? new Date(patient.vitals.recorded_at).toLocaleDateString()
                            : "Never"}
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-green-600 font-medium">Heart Rate</div>
                        <div className="text-2xl font-bold">
                          {patient.vitals?.heart_rate ? `${patient.vitals.heart_rate} bpm` : "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Last recorded:{" "}
                          {patient.vitals?.recorded_at
                            ? new Date(patient.vitals.recorded_at).toLocaleDateString()
                            : "Never"}
                        </div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-sm text-yellow-600 font-medium">Temperature</div>
                        <div className="text-2xl font-bold">
                          {patient.vitals?.temperature ? `${patient.vitals.temperature} °C` : "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Last recorded:{" "}
                          {patient.vitals?.recorded_at
                            ? new Date(patient.vitals.recorded_at).toLocaleDateString()
                            : "Never"}
                        </div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-sm text-purple-600 font-medium">Oxygen Saturation</div>
                        <div className="text-2xl font-bold">
                          {patient.vitals?.oxygen_saturation ? `${patient.vitals.oxygen_saturation}%` : "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Last recorded:{" "}
                          {patient.vitals?.recorded_at
                            ? new Date(patient.vitals.recorded_at).toLocaleDateString()
                            : "Never"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Upcoming Appointments</h3>
                    {patient.upcoming_appointments && patient.upcoming_appointments.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Date & Time
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Provider
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Type
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {patient.upcoming_appointments.map((appointment) => (
                              <tr key={appointment.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(appointment.datetime).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {appointment.provider_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {appointment.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      appointment.status === "confirmed"
                                        ? "bg-green-100 text-green-800"
                                        : appointment.status === "pending"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No upcoming appointments scheduled.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "medical_history" && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Medical History</h2>

                  {/* Medical history content would go here */}
                  <p className="text-gray-500">Detailed medical history information would be displayed here.</p>
                </div>
              )}

              {activeTab === "medications" && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Medications</h2>

                  {/* Medications content would go here */}
                  <p className="text-gray-500">Current and past medication information would be displayed here.</p>
                </div>
              )}

              {activeTab === "lab_results" && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Lab Results</h2>

                  {/* Lab results content would go here */}
                  <p className="text-gray-500">Laboratory test results would be displayed here.</p>
                </div>
              )}

              {activeTab === "wearable_data" && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Wearable Device Data</h2>

                  {/* Wearable data content would go here */}
                  <p className="text-gray-500">Data from connected wearable devices would be displayed here.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">
              Patient not found or you do not have permission to view this information.
            </span>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
