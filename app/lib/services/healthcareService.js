import api from "../apiClient"

// Healthcare API calls
export const healthcare = {
  // Medical Records
  getMedicalRecord: async (id) => {
    const response = await api.get(`/healthcare/medical-records/${id}`)
    return response.data
  },

  getMedicalRecords: async (patientId) => {
    const params = patientId ? { patient: patientId } : {}
    const response = await api.get("/healthcare/medical-records", { params })
    return response.data
  },

  createMedicalRecord: async (data) => {
    const response = await api.post("/healthcare/medical-records", data)
    return response.data
  },

  updateMedicalRecord: async (id, data) => {
    const response = await api.put(`/healthcare/medical-records/${id}`, data)
    return response.data
  },

  deleteMedicalRecord: async (id) => {
    const response = await api.delete(`/healthcare/medical-records/${id}`)
    return response.data
  },

  // Conditions
  getConditions: async (medicalRecordId) => {
    const params = medicalRecordId ? { medical_record: medicalRecordId } : {}
    const response = await api.get("/healthcare/conditions", { params })
    return response.data
  },

  getCondition: async (id) => {
    const response = await api.get(`/healthcare/conditions/${id}`)
    return response.data
  },

  createCondition: async (data) => {
    const response = await api.post("/healthcare/conditions", data)
    return response.data
  },

  updateCondition: async (id, data) => {
    const response = await api.put(`/healthcare/conditions/${id}`, data)
    return response.data
  },

  deleteCondition: async (id) => {
    const response = await api.delete(`/healthcare/conditions/${id}`)
    return response.data
  },

  // Condition Flares
  getConditionFlares: async (conditionId) => {
    const params = conditionId ? { condition: conditionId } : {}
    const response = await api.get("/healthcare/condition-flares", { params })
    return response.data
  },

  // Allergies
  getAllergies: async (medicalRecordId) => {
    const params = medicalRecordId ? { medical_record: medicalRecordId } : {}
    const response = await api.get("/healthcare/allergies", { params })
    return response.data
  },

  // Medications
  getMedications: async (medicalRecordId) => {
    const params = medicalRecordId ? { medical_record: medicalRecordId } : {}
    const response = await api.get("/healthcare/medications", { params })
    return response.data
  },

  // Medication Intakes
  getMedicationIntakes: async (medicationId) => {
    const params = medicationId ? { medication: medicationId } : {}
    const response = await api.get("/healthcare/medication-intakes", { params })
    return response.data
  },

  // Immunizations
  getImmunizations: async (medicalRecordId) => {
    const params = medicalRecordId ? { medical_record: medicalRecordId } : {}
    const response = await api.get("/healthcare/immunizations", { params })
    return response.data
  },

  // Lab Tests
  getLabTests: async (medicalRecordId) => {
    const params = medicalRecordId ? { medical_record: medicalRecordId } : {}
    const response = await api.get("/healthcare/lab-tests", { params })
    return response.data
  },

  // Lab Results
  getLabResults: async (testId) => {
    const params = testId ? { lab_test: testId } : {}
    const response = await api.get("/healthcare/lab-results", { params })
    return response.data
  },

  // Vital Signs
  getVitalSigns: async (medicalRecordId) => {
    const params = medicalRecordId ? { medical_record: medicalRecordId } : {}
    const response = await api.get("/healthcare/vital-signs", { params })
    return response.data
  },

  // Treatments
  getTreatments: async (medicalRecordId) => {
    const params = medicalRecordId ? { medical_record: medicalRecordId } : {}
    const response = await api.get("/healthcare/treatments", { params })
    return response.data
  },

  // Family History
  getFamilyHistory: async (medicalRecordId) => {
    const params = medicalRecordId ? { medical_record: medicalRecordId } : {}
    const response = await api.get("/healthcare/family-history", { params })
    return response.data
  },

  // Health Data Consents
  getHealthDataConsents: async (patientId) => {
    const params = patientId ? { patient: patientId } : {}
    const response = await api.get("/healthcare/health-data-consents", { params })
    return response.data
  },

  // Rare Conditions
  getRareConditions: async () => {
    const response = await api.get("/healthcare/rare-conditions")
    return response.data
  },

  getRareCondition: async (id) => {
    const response = await api.get(`/healthcare/rare-conditions/${id}`)
    return response.data
  },

  // Referral Network
  getReferralNetwork: async (specialtyCategory) => {
    const params = specialtyCategory ? { specialty_category: specialtyCategory } : {}
    const response = await api.get("/healthcare/referral-network", { params })
    return response.data
  },
}

export default healthcare
