import api from "../apiClient"

// Medication API calls
export const medication = {
  // Medications
  getMedications: async (options = {}) => {
    const response = await api.get("/medication/medications", { params: options })
    return response.data
  },

  getMedication: async (id) => {
    const response = await api.get(`/medication/medications/${id}`)
    return response.data
  },

  createMedication: async (medicationData) => {
    const response = await api.post("/medication/medications", medicationData)
    return response.data
  },

  updateMedication: async (id, medicationData) => {
    const response = await api.patch(`/medication/medications/${id}`, medicationData)
    return response.data
  },

  deleteMedication: async (id) => {
    const response = await api.delete(`/medication/medications/${id}`)
    return response.data
  },

  // Medication Adherence
  getMedicationAdherence: async (patientId) => {
    const params = patientId ? { patient: patientId } : {}
    const response = await api.get("/medication/adherence", { params })
    return response.data
  },

  recordMedicationIntake: async (intakeData) => {
    const response = await api.post("/medication/intakes", intakeData)
    return response.data
  },

  getMedicationIntakes: async (medicationId) => {
    const params = medicationId ? { medication: medicationId } : {}
    const response = await api.get("/medication/intakes", { params })
    return response.data
  },

  // Medication Reminders
  getMedicationReminders: async (patientId) => {
    const params = patientId ? { patient: patientId } : {}
    const response = await api.get("/medication/reminders", { params })
    return response.data
  },

  createMedicationReminder: async (reminderData) => {
    const response = await api.post("/medication/reminders", reminderData)
    return response.data
  },

  updateMedicationReminder: async (id, reminderData) => {
    const response = await api.patch(`/medication/reminders/${id}`, reminderData)
    return response.data
  },

  deleteMedicationReminder: async (id) => {
    const response = await api.delete(`/medication/reminders/${id}`)
    return response.data
  },

  // Medication Schedule
  getMedicationSchedule: async (patientId) => {
    const params = patientId ? { patient: patientId } : {}
    const response = await api.get("/medication/schedule", { params })
    return response.data
  },

  // Pharmacy Integration
  getPharmacies: async (options = {}) => {
    const response = await api.get("/medication/pharmacies", { params: options })
    return response.data
  },

  requestRefill: async (medicationId) => {
    const response = await api.post(`/medication/medications/${medicationId}/refill`)
    return response.data
  },

  // Specialty Medications
  getSpecialtyMedications: async () => {
    const response = await api.get("/medication/specialty-medications")
    return response.data
  },
}

export default medication
