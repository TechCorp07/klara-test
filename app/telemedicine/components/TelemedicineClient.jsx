"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "react-toastify"

/**
 * Client component for telemedicine page
 * Provides appointment scheduling, management, and virtual consultations
 */
export default function TelemedicineClient() {
  // Authentication and state
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  // Appointment data state
  const [appointments, setAppointments] = useState([])
  const [providers, setProviders] = useState([])

  // Form state
  const [selectedProvider, setSelectedProvider] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [appointmentReason, setAppointmentReason] = useState("")
  const [availableTimes, setAvailableTimes] = useState([])

  // UI state
  const [activeTab, setActiveTab] = useState("upcoming")
  const [isScheduling, setIsScheduling] = useState(false)

  // Fetch appointments and providers
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // This would be replaced with actual API calls
        setTimeout(() => {
          setAppointments([
            {
              id: 1,
              provider: {
                id: 1,
                name: "Dr. Sarah Smith",
                specialty: "Cardiology",
                image: null,
              },
              scheduled_time: "2023-07-15T14:30:00Z",
              end_time: "2023-07-15T15:00:00Z",
              status: "scheduled",
              appointment_type: "video_consultation",
              reason: "Follow-up for hypertension",
              notes: "",
              join_url: "https://zoom.us/j/123456789",
              meeting_id: "123456789",
            },
            {
              id: 2,
              provider: {
                id: 2,
                name: "Dr. Michael Johnson",
                specialty: "Endocrinology",
                image: null,
              },
              scheduled_time: "2023-08-05T10:15:00Z",
              end_time: "2023-08-05T10:45:00Z",
              status: "scheduled",
              appointment_type: "initial_consultation",
              reason: "Diabetes management",
              notes: "Bring recent lab results",
              join_url: "https://zoom.us/j/987654321",
              meeting_id: "987654321",
            },
            {
              id: 3,
              provider: {
                id: 1,
                name: "Dr. Sarah Smith",
                specialty: "Cardiology",
                image: null,
              },
              scheduled_time: "2023-06-10T13:00:00Z",
              end_time: "2023-06-10T13:30:00Z",
              status: "completed",
              appointment_type: "follow_up",
              reason: "Blood pressure check",
              notes: "Medication adjustment recommended",
              join_url: "https://zoom.us/j/111222333",
              meeting_id: "111222333",
            },
          ])

          setProviders([
            {
              id: 1,
              name: "Dr. Sarah Smith",
              specialty: "Cardiology",
              image: null,
              available_days: ["Monday", "Wednesday", "Friday"],
              rating: 4.8,
              reviews: 42,
            },
            {
              id: 2,
              name: "Dr. Michael Johnson",
              specialty: "Endocrinology",
              image: null,
              available_days: ["Tuesday", "Thursday"],
              rating: 4.9,
              reviews: 37,
            },
            {
              id: 3,
              name: "Dr. Emily Chen",
              specialty: "Neurology",
              image: null,
              available_days: ["Monday", "Tuesday", "Friday"],
              rating: 4.7,
              reviews: 28,
            },
            {
              id: 4,
              name: "Dr. Robert Williams",
              specialty: "Pulmonology",
              image: null,
              available_days: ["Wednesday", "Thursday", "Friday"],
              rating: 4.6,
              reviews: 31,
            },
          ])

          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching telemedicine data:", error)
        toast.error("Failed to load telemedicine data")
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  /**
   * Handles the selection of a provider from the dropdown
   */
  const handleProviderSelect = (e) => {
    setSelectedProvider(e.target.value)
  }

  /**
   * Handles the selection of a date and generates available time slots
   */
  const handleDateSelect = (e) => {
    setSelectedDate(e.target.value)

    // Generate available times based on selected date
    // This would be replaced with actual API call to get provider availability
    const times = []
    const startHour = 9
    const endHour = 17

    for (let hour = startHour; hour < endHour; hour++) {
      times.push(`${hour}:00`)
      times.push(`${hour}:30`)
    }

    setAvailableTimes(times)
  }

  /**
   * Handles the selection of a time slot
   */
  const handleTimeSelect = (e) => {
    setSelectedTime(e.target.value)
  }

  /**
   * Handles changes to the appointment reason
   */
  const handleReasonChange = (e) => {
    setAppointmentReason(e.target.value)
  }

  /**
   * Handles the submission of a new appointment
   */
  const handleScheduleAppointment = async () => {
    if (!selectedProvider || !selectedDate || !selectedTime || !appointmentReason) {
      toast.warning("Please fill in all appointment details")
      return
    }

    setIsScheduling(true)
    try {
      // This would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const provider = providers.find((p) => p.id === Number.parseInt(selectedProvider))

      // Create new appointment
      const newAppointment = {
        id: appointments.length + 1,
        provider: {
          id: provider.id,
          name: provider.name,
          specialty: provider.specialty,
          image: provider.image,
        },
        scheduled_time: new Date(`${selectedDate}T${selectedTime}`).toISOString(),
        end_time: new Date(`${selectedDate}T${selectedTime}`).toISOString(),
        status: "scheduled",
        appointment_type: "video_consultation",
        reason: appointmentReason,
        notes: "",
        join_url: "https://zoom.us/j/000000000",
        meeting_id: "000000000",
      }

      setAppointments([...appointments, newAppointment])
      toast.success("Appointment scheduled successfully")

      // Reset form
      setSelectedProvider("")
      setSelectedDate("")
      setSelectedTime("")
      setAppointmentReason("")
      setAvailableTimes([])

      // Switch to upcoming appointments tab
      setActiveTab("upcoming")
    } catch (error) {
      console.error("Error scheduling appointment:", error)
      toast.error("Failed to schedule appointment")
    } finally {
      setIsScheduling(false)
    }
  }

  /**
   * Handles cancellation of an appointment
   */
  const handleCancelAppointment = async (appointmentId) => {
    try {
      // This would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update appointment status
      setAppointments(
        appointments.map((appointment) => {
          if (appointment.id === appointmentId) {
            return { ...appointment, status: "cancelled" }
          }
          return appointment
        }),
      )

      toast.success("Appointment cancelled successfully")
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      toast.error("Failed to cancel appointment")
    }
  }

  /**
   * Handles rescheduling of an appointment
   */
  const handleRescheduleAppointment = (appointmentId) => {
    // Find the appointment to reschedule
    const appointment = appointments.find((a) => a.id === appointmentId)

    // Pre-fill the scheduling form
    setSelectedProvider(appointment.provider.id.toString())
    setAppointmentReason(appointment.reason)

    // Switch to schedule tab
    setActiveTab("schedule")

    // Scroll to scheduling form
    document.getElementById("scheduling-form")?.scrollIntoView({ behavior: "smooth" })
  }

  /**
   * Opens the meeting URL in a new tab
   */
  const handleJoinAppointment = (joinUrl) => {
    window.open(joinUrl, "_blank")
  }

  /**
   * Formats a date string for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  /**
   * Formats a time string for display
   */
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  /**
   * Gets upcoming appointments
   */
  const getUpcomingAppointments = () => {
    return appointments.filter(
      (appointment) => appointment.status === "scheduled" && new Date(appointment.scheduled_time) > new Date(),
    )
  }

  /**
   * Gets past appointments
   */
  const getPastAppointments = () => {
    return appointments.filter(
      (appointment) => appointment.status === "completed" || new Date(appointment.scheduled_time) < new Date(),
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Telemedicine</h1>
        <p className="text-gray-600">Schedule and manage your virtual appointments</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <svg
            className="animate-spin h-8 w-8 text-primary-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="ml-2 text-gray-600">Loading telemedicine data...</span>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`${
                  activeTab === "upcoming"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab("upcoming")}
              >
                Upcoming Appointments
              </button>
              <button
                className={`${
                  activeTab === "past"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab("past")}
              >
                Past Appointments
              </button>
              <button
                className={`${
                  activeTab === "schedule"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab("schedule")}
              >
                Schedule New Appointment
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "upcoming" && (
            <div>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Appointments</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Your scheduled telemedicine consultations.</p>
                </div>

                {getUpcomingAppointments().length === 0 ? (
                  <div className="px-4 py-5 sm:p-6 text-center">
                    <p className="text-gray-500">No upcoming appointments</p>
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={() => setActiveTab("schedule")}
                    >
                      Schedule an Appointment
                    </button>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {getUpcomingAppointments().map((appointment) => (
                        <li key={appointment.id} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-primary-800 text-lg font-medium">
                                  {appointment.provider.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              </div>
                              <div className="ml-4">
                                <h4 className="text-lg font-medium text-gray-900">{appointment.provider.name}</h4>
                                <p className="text-sm text-gray-500">{appointment.provider.specialty}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="text-sm font-medium text-gray-900">
                                {formatDate(appointment.scheduled_time)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatTime(appointment.scheduled_time)} - {formatTime(appointment.end_time)}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="text-sm text-gray-500">
                              <span className="font-medium text-gray-900">Reason:</span> {appointment.reason}
                            </div>
                            {appointment.notes && (
                              <div className="mt-1 text-sm text-gray-500">
                                <span className="font-medium text-gray-900">Notes:</span> {appointment.notes}
                              </div>
                            )}
                          </div>

                          <div className="mt-4 flex justify-end space-x-4">
                            <button
                              type="button"
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                              onClick={() => handleRescheduleAppointment(appointment.id)}
                            >
                              Reschedule
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                              onClick={() => handleCancelAppointment(appointment.id)}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                              onClick={() => handleJoinAppointment(appointment.join_url)}
                            >
                              Join Meeting
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preparing for Your Telemedicine Visit</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-base font-medium text-gray-900 mb-2">Before Your Appointment</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                      <li>Find a quiet, private space with good lighting</li>
                      <li>Test your camera and microphone</li>
                      <li>Ensure you have a stable internet connection</li>
                      <li>Have your medications list ready</li>
                      <li>Write down any questions or concerns</li>
                      <li>Have any relevant medical devices ready (thermometer, blood pressure monitor, etc.)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-gray-900 mb-2">During Your Appointment</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                      <li>Join the meeting 5 minutes early</li>
                      <li>Speak clearly and face the camera</li>
                      <li>Describe your symptoms in detail</li>
                      <li>Ask questions about your treatment plan</li>
                      <li>Take notes on recommendations</li>
                      <li>Confirm next steps before ending the call</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "past" && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Past Appointments</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">History of your telemedicine consultations.</p>
              </div>

              {getPastAppointments().length === 0 ? (
                <div className="px-4 py-5 sm:p-6 text-center">
                  <p className="text-gray-500">No past appointments</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
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
                          Date & Time
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Reason
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getPastAppointments().map((appointment) => (
                        <tr key={appointment.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-primary-800 font-medium">
                                  {appointment.provider.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{appointment.provider.name}</div>
                                <div className="text-sm text-gray-500">{appointment.provider.specialty}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(appointment.scheduled_time)}</div>
                            <div className="text-sm text-gray-500">{formatTime(appointment.scheduled_time)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{appointment.reason}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                appointment.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : appointment.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {appointment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              type="button"
                              className="text-primary-600 hover:text-primary-900"
                              onClick={() => {
                                // View appointment details or notes
                                toast.info("Viewing appointment details will be implemented in a future update")
                              }}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "schedule" && (
            <div id="scheduling-form" className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Schedule New Appointment</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Book a telemedicine consultation with a healthcare provider.
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
                      Select Provider
                    </label>
                    <select
                      id="provider"
                      name="provider"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      value={selectedProvider}
                      onChange={handleProviderSelect}
                    >
                      <option value="">Select a provider...</option>
                      {providers.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name} - {provider.specialty}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedProvider && (
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                        Select Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        id="date"
                        min={new Date().toISOString().split("T")[0]}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        value={selectedDate}
                        onChange={handleDateSelect}
                      />
                    </div>
                  )}

                  {selectedDate && (
                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                        Select Time
                      </label>
                      <select
                        id="time"
                        name="time"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        value={selectedTime}
                        onChange={handleTimeSelect}
                      >
                        <option value="">Select a time slot...</option>
                        {availableTimes.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                      Reason for Visit
                    </label>
                    <textarea
                      id="reason"
                      name="reason"
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Please describe the reason for your appointment"
                      value={appointmentReason}
                      onChange={handleReasonChange}
                    />
                  </div>
                </div>

                {selectedProvider && (
                  <div className="mt-6 bg-gray-50 p-4 rounded-md">
                    <h4 className="text-base font-medium text-gray-900 mb-2">Provider Information</h4>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-800 font-medium">
                          {providers
                            .find((p) => p.id === Number.parseInt(selectedProvider))
                            ?.name.split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div className="ml-4">
                        <h5 className="text-sm font-medium text-gray-900">
                          {providers.find((p) => p.id === Number.parseInt(selectedProvider))?.name}
                        </h5>
                        <p className="text-sm text-gray-500">
                          {providers.find((p) => p.id === Number.parseInt(selectedProvider))?.specialty}
                        </p>
                        <div className="mt-1 flex items-center">
                          <svg className="text-yellow-400 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="ml-1 text-sm text-gray-500">
                            {providers.find((p) => p.id === Number.parseInt(selectedProvider))?.rating} (
                            {providers.find((p) => p.id === Number.parseInt(selectedProvider))?.reviews} reviews)
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Available on:{" "}
                          {providers.find((p) => p.id === Number.parseInt(selectedProvider))?.available_days.join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleScheduleAppointment}
                    disabled={!selectedProvider || !selectedDate || !selectedTime || !appointmentReason || isScheduling}
                  >
                    {isScheduling ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Scheduling...
                      </>
                    ) : (
                      "Schedule Appointment"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Telemedicine FAQs</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <dl className="space-y-6">
                <div>
                  <dt className="text-base font-medium text-gray-900">What is telemedicine?</dt>
                  <dd className="mt-1 text-sm text-gray-500">
                    Telemedicine allows you to consult with healthcare providers remotely using video conferencing
                    technology. It's convenient, secure, and provides access to care from the comfort of your home.
                  </dd>
                </div>
                <div>
                  <dt className="text-base font-medium text-gray-900">What equipment do I need?</dt>
                  <dd className="mt-1 text-sm text-gray-500">
                    You'll need a device with a camera and microphone (smartphone, tablet, or computer), a stable
                    internet connection, and a quiet, well-lit space for your appointment.
                  </dd>
                </div>
                <div>
                  <dt className="text-base font-medium text-gray-900">Is telemedicine secure and private?</dt>
                  <dd className="mt-1 text-sm text-gray-500">
                    Yes, our telemedicine platform is HIPAA-compliant and uses encryption to protect your privacy. Your
                    consultation is confidential, just like an in-person visit.
                  </dd>
                </div>
                <div>
                  <dt className="text-base font-medium text-gray-900">What if I need lab work or a physical exam?</dt>
                  <dd className="mt-1 text-sm text-gray-500">
                    Your provider will determine if you need in-person care. They can order lab tests or refer you for
                    an in-person visit if necessary after your telemedicine consultation.
                  </dd>
                </div>
                <div>
                  <dt className="text-base font-medium text-gray-900">How do I get prescriptions?</dt>
                  <dd className="mt-1 text-sm text-gray-500">
                    Providers can prescribe medications during your telemedicine visit. Prescriptions will be sent
                    electronically to your preferred pharmacy for pickup.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
