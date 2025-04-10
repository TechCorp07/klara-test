import api from "../apiClient"

// Telemedicine API calls
export const telemedicine = {
  // Appointments
  getAppointments: async (options = {}) => {
    const response = await api.get("/telemedicine/appointments", { params: options })
    return response.data
  },

  getUpcomingAppointments: async () => {
    const response = await api.get("/telemedicine/appointments/upcoming")
    return response.data
  },

  createAppointment: async (appointmentData) => {
    const response = await api.post("/telemedicine/appointments", appointmentData)
    return response.data
  },

  getAppointment: async (id) => {
    const response = await api.get(`/telemedicine/appointments/${id}`)
    return response.data
  },

  updateAppointment: async (id, appointmentData) => {
    const response = await api.patch(`/telemedicine/appointments/${id}`, appointmentData)
    return response.data
  },

  cancelAppointment: async (id, reason) => {
    const response = await api.post(`/telemedicine/appointments/${id}/cancel`, { reason })
    return response.data
  },

  // Consultations
  getConsultation: async (id) => {
    const response = await api.get(`/telemedicine/consultations/${id}`)
    return response.data
  },

  getConsultationsByAppointment: async (appointmentId) => {
    const params = appointmentId ? { appointment: appointmentId } : {}
    const response = await api.get("/telemedicine/consultations", { params })
    return response.data
  },

  startConsultation: async (consultationId) => {
    const response = await api.post(`/telemedicine/consultations/${consultationId}/start`)
    return response.data
  },

  endConsultation: async (consultationId, notes) => {
    const response = await api.post(`/telemedicine/consultations/${consultationId}/end`, { notes })
    return response.data
  },

  getJoinInfo: async (consultationId) => {
    const response = await api.get(`/telemedicine/consultations/${consultationId}/join_info`)
    return response.data
  },

  // Provider Availability
  getProviderAvailability: async (providerId) => {
    const params = providerId ? { provider: providerId } : {}
    const response = await api.get("/telemedicine/availability", { params })
    return response.data
  },

  // Waiting Rooms
  getWaitingRooms: async () => {
    const response = await api.get("/telemedicine/waiting-rooms")
    return response.data
  },

  getWaitingRoomPatients: async (waitingRoomId) => {
    const params = waitingRoomId ? { waiting_room: waitingRoomId } : {}
    const response = await api.get("/telemedicine/waiting-room-patients", { params })
    return response.data
  },

  // Prescriptions
  getPrescriptions: async (patientId) => {
    const params = patientId ? { patient: patientId } : {}
    const response = await api.get("/telemedicine/prescriptions", { params })
    return response.data
  },

  createPrescription: async (prescriptionData) => {
    const response = await api.post("/telemedicine/prescriptions", prescriptionData)
    return response.data
  },

  updatePrescription: async (id, prescriptionData) => {
    const response = await api.patch(`/telemedicine/prescriptions/${id}`, prescriptionData)
    return response.data
  },

  // Consultation Notes
  getConsultationNotes: async (consultationId) => {
    const params = consultationId ? { consultation: consultationId } : {}
    const response = await api.get("/telemedicine/consultation-notes", { params })
    return response.data
  },
}

export default telemedicine
