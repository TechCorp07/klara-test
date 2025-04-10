"use client"

// components/appointments/AppointmentForm.js
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { format, addDays, isBefore, startOfDay, parse } from "date-fns"
import { FaCalendarAlt, FaClock, FaVideo, FaPhoneAlt, FaHospital, FaInfoCircle } from "react-icons/fa"

/**
 * Form for creating or editing appointments
 * @param {Object} props
 * @param {Object} props.appointment - Existing appointment data for editing (optional)
 * @param {Array} props.providers - List of available healthcare providers
 * @param {Array} props.availableSlots - List of available time slots
 * @param {Function} props.onSubmit - Submit handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {boolean} props.isLoading - Loading state
 * @param {boolean} props.isEditing - Whether we're editing an existing appointment
 */
const AppointmentForm = ({
  appointment = null,
  providers = [],
  availableSlots = [],
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false,
}) => {
  const [appointmentType, setAppointmentType] = useState(appointment?.appointment_type || "video_consultation")
  const [selectedDate, setSelectedDate] = useState(
    appointment?.scheduled_time ? new Date(appointment.scheduled_time) : addDays(new Date(), 1),
  )
  const [selectedProvider, setSelectedProvider] = useState(appointment?.provider_id || "")
  const [filteredSlots, setFilteredSlots] = useState([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      provider_id: appointment?.provider_id || "",
      appointment_date: appointment?.scheduled_time
        ? format(new Date(appointment.scheduled_time), "yyyy-MM-dd")
        : format(addDays(new Date(), 1), "yyyy-MM-dd"),
      appointment_time: appointment?.scheduled_time ? format(new Date(appointment.scheduled_time), "HH:mm") : "09:00",
      appointment_type: appointment?.appointment_type || "video_consultation",
      reason: appointment?.reason || "",
      notes: appointment?.notes || "",
    },
  })

  const appointmentDate = watch("appointment_date")
  const appointmentTime = watch("appointment_time")

  // Update filtered time slots when date or provider changes
  useEffect(() => {
    if (appointmentDate && selectedProvider) {
      const date = parse(appointmentDate, "yyyy-MM-dd", new Date())
      const providerSlots = availableSlots.filter(
        (slot) => slot.provider_id === selectedProvider && isBefore(startOfDay(date), new Date(slot.start_time)),
      )
      setFilteredSlots(providerSlots)
    } else {
      setFilteredSlots([])
    }
  }, [appointmentDate, selectedProvider, availableSlots])

  // Update form values when appointment type changes
  useEffect(() => {
    setValue("appointment_type", appointmentType)
  }, [appointmentType, setValue])

  // Handle provider selection
  const handleProviderChange = (e) => {
    setSelectedProvider(e.target.value)
    setValue("provider_id", e.target.value)
  }

  // Handle date selection
  const handleDateChange = (e) => {
    const date = e.target.value
    setSelectedDate(parse(date, "yyyy-MM-dd", new Date()))
    setValue("appointment_date", date)
  }

  // Handle form submission
  const handleFormSubmit = (data) => {
    // Convert date and time to ISO format
    const dateTime = parse(`${data.appointment_date} ${data.appointment_time}`, "yyyy-MM-dd HH:mm", new Date())

    // Prepare data for submission
    const appointmentData = {
      provider_id: data.provider_id,
      scheduled_time: dateTime.toISOString(),
      appointment_type: data.appointment_type,
      reason: data.reason,
      notes: data.notes,
    }

    // If editing, include the appointment ID
    if (isEditing && appointment?.id) {
      appointmentData.id = appointment.id
    }

    onSubmit(appointmentData)
  }

  // Format available time slots for display
  const formatTimeSlot = (slot) => {
    const startTime = new Date(slot.start_time)
    const endTime = new Date(slot.end_time)
    return `${format(startTime, "h:mm a")} - ${format(endTime, "h:mm a")}`
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Appointment Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            className={`border rounded-md p-3 cursor-pointer ${
              appointmentType === "video_consultation"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-300"
            }`}
            onClick={() => setAppointmentType("video_consultation")}
          >
            <div className="flex items-center">
              <FaVideo className="h-5 w-5 text-blue-500 mr-2" />
              <span className="block text-sm font-medium">Video Consultation</span>
            </div>
            <span className="block text-xs text-gray-500 mt-1">Meet with your provider online</span>
          </div>

          <div
            className={`border rounded-md p-3 cursor-pointer ${
              appointmentType === "phone_consultation"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-300"
            }`}
            onClick={() => setAppointmentType("phone_consultation")}
          >
            <div className="flex items-center">
              <FaPhoneAlt className="h-5 w-5 text-green-500 mr-2" />
              <span className="block text-sm font-medium">Phone Consultation</span>
            </div>
            <span className="block text-xs text-gray-500 mt-1">Speak with your provider by phone</span>
          </div>

          <div
            className={`border rounded-md p-3 cursor-pointer ${
              appointmentType === "in_person" ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-300"
            }`}
            onClick={() => setAppointmentType("in_person")}
          >
            <div className="flex items-center">
              <FaHospital className="h-5 w-5 text-purple-500 mr-2" />
              <span className="block text-sm font-medium">In-Person Visit</span>
            </div>
            <span className="block text-xs text-gray-500 mt-1">Visit your provider's office</span>
          </div>
        </div>
        <input type="hidden" {...register("appointment_type", { required: true })} />
      </div>

      {/* Provider Selection */}
      <div>
        <label htmlFor="provider_id" className="block text-sm font-medium text-gray-700 mb-1">
          Select Healthcare Provider
        </label>
        <select
          id="provider_id"
          {...register("provider_id", { required: "Please select a provider" })}
          onChange={handleProviderChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">-- Select a provider --</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              Dr. {provider.first_name} {provider.last_name} ({provider.specialty})
            </option>
          ))}
        </select>
        {errors.provider_id && <p className="mt-1 text-sm text-red-600">{errors.provider_id.message}</p>}
      </div>

      {/* Date and Time Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="appointment_date" className="block text-sm font-medium text-gray-700 mb-1">
            <FaCalendarAlt className="inline-block mr-1 h-4 w-4" /> Appointment Date
          </label>
          <input
            type="date"
            id="appointment_date"
            {...register("appointment_date", { required: "Date is required" })}
            onChange={handleDateChange}
            min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.appointment_date && <p className="mt-1 text-sm text-red-600">{errors.appointment_date.message}</p>}
        </div>

        <div>
          <label htmlFor="appointment_time" className="block text-sm font-medium text-gray-700 mb-1">
            <FaClock className="inline-block mr-1 h-4 w-4" /> Time
          </label>
          <select
            id="appointment_time"
            {...register("appointment_time", { required: "Time is required" })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">-- Select a time --</option>
            {filteredSlots.length > 0 ? (
              filteredSlots.map((slot, index) => (
                <option key={index} value={format(new Date(slot.start_time), "HH:mm")}>
                  {formatTimeSlot(slot)}
                </option>
              ))
            ) : (
              <>
                <option value="09:00">9:00 AM - 9:30 AM</option>
                <option value="09:30">9:30 AM - 10:00 AM</option>
                <option value="10:00">10:00 AM - 10:30 AM</option>
                <option value="10:30">10:30 AM - 11:00 AM</option>
                <option value="11:00">11:00 AM - 11:30 AM</option>
                <option value="13:00">1:00 PM - 1:30 PM</option>
                <option value="13:30">1:30 PM - 2:00 PM</option>
                <option value="14:00">2:00 PM - 2:30 PM</option>
                <option value="14:30">2:30 PM - 3:00 PM</option>
                <option value="15:00">3:00 PM - 3:30 PM</option>
                <option value="15:30">3:30 PM - 4:00 PM</option>
                <option value="16:00">4:00 PM - 4:30 PM</option>
              </>
            )}
          </select>
          {errors.appointment_time && <p className="mt-1 text-sm text-red-600">{errors.appointment_time.message}</p>}
        </div>
      </div>

      {/* Reason for Visit */}
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
          Reason for Visit
        </label>
        <input
          type="text"
          id="reason"
          {...register("reason", { required: "Please provide a reason for your visit" })}
          placeholder="e.g., Annual checkup, Follow-up, Headache"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
        {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>}
      </div>

      {/* Additional Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes (Optional)
        </label>
        <textarea
          id="notes"
          rows="3"
          {...register("notes")}
          placeholder="Any additional information for your provider"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        ></textarea>
      </div>

      {/* HIPAA Notice */}
      <div className="bg-blue-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaInfoCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              This appointment and the information you provide are protected under HIPAA regulations. Your health
              information will only be shared with your healthcare provider.
            </p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              {isEditing ? "Updating..." : "Scheduling..."}
            </>
          ) : isEditing ? (
            "Update Appointment"
          ) : (
            "Schedule Appointment"
          )}
        </button>
      </div>
    </form>
  )
}

export default AppointmentForm
