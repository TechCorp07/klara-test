import api from "../apiClient"

// FHIR API calls
export const fhir = {
  // Patient Resources
  getPatientResource: async (patientId) => {
    const response = await api.get(`/fhir/Patient/${patientId}`)
    return response.data
  },

  // Observation Resources
  getObservations: async (patientId) => {
    const params = patientId ? { patient: patientId } : {}
    const response = await api.get("/fhir/Observation", { params })
    return response.data
  },

  // Condition Resources
  getConditions: async (patientId) => {
    const params = patientId ? { patient: patientId } : {}
    const response = await api.get("/fhir/Condition", { params })
    return response.data
  },

  // MedicationStatement Resources
  getMedicationStatements: async (patientId) => {
    const params = patientId ? { patient: patientId } : {}
    const response = await api.get("/fhir/MedicationStatement", { params })
    return response.data
  },

  // AllergyIntolerance Resources
  getAllergyIntolerances: async (patientId) => {
    const params = patientId ? { patient: patientId } : {}
    const response = await api.get("/fhir/AllergyIntolerance", { params })
    return response.data
  },

  // Immunization Resources
  getImmunizations: async (patientId) => {
    const params = patientId ? { patient: patientId } : {}
    const response = await api.get("/fhir/Immunization", { params })
    return response.data
  },

  // DiagnosticReport Resources
  getDiagnosticReports: async (patientId) => {
    const params = patientId ? { patient: patientId } : {}
    const response = await api.get("/fhir/DiagnosticReport", { params })
    return response.data
  },

  // Procedure Resources
  getProcedures: async (patientId) => {
    const params = patientId ? { patient: patientId } : {}
    const response = await api.get("/fhir/Procedure", { params })
    return response.data
  },

  // CarePlan Resources
  getCarePlans: async (patientId) => {
    const params = patientId ? { patient: patientId } : {}
    const response = await api.get("/fhir/CarePlan", { params })
    return response.data
  },

  // Export FHIR Resources
  exportFhirResources: async (patientId, resourceTypes) => {
    const params = {
      patient: patientId,
      _type: resourceTypes.join(","),
    }
    const response = await api.get("/fhir/$export", { params })
    return response.data
  },
}

export default fhir
