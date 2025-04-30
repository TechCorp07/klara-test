/**
 * EHR service for interacting with Electronic Health Record systems
 */

import { apiRequest } from "../../../api/client"
import fhirService from "./fhirService"

/**
 * EHR service that provides access to EHR-specific functionality
 */
export const ehrService = {
  /**
   * Get patient EHR data
   * @param {string} patientId - Patient ID
   * @param {string} dataType - Type of data to retrieve ('all', 'medications', 'conditions', etc.)
   * @returns {Promise<Object>} Patient EHR data
   */
  getPatientData: (patientId, dataType = "all") =>
    apiRequest("GET", `/ehr/patients/${patientId}/data`, null, {
      params: { data_type: dataType },
      errorMessage: "Failed to fetch patient EHR data",
    }),

  /**
   * Search for patients in the EHR
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} Search results
   */
  searchPatients: (searchParams) =>
    apiRequest("GET", "/ehr/patients/search", null, {
      params: searchParams,
      errorMessage: "Failed to search patients",
    }),

  /**
   * Get patient medications
   * @param {string} patientId - Patient ID
   * @param {boolean} includeInactive - Whether to include inactive medications
   * @returns {Promise<Object>} Patient medications
   */
  getPatientMedications: (patientId, includeInactive = false) =>
    apiRequest("GET", `/ehr/patients/${patientId}/medications`, null, {
      params: { include_inactive: includeInactive },
      errorMessage: "Failed to fetch patient medications",
    }),

  /**
   * Get patient allergies
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} Patient allergies
   */
  getPatientAllergies: (patientId) =>
    apiRequest("GET", `/ehr/patients/${patientId}/allergies`, null, {
      errorMessage: "Failed to fetch patient allergies",
    }),

  /**
   * Get patient conditions
   * @param {string} patientId - Patient ID
   * @param {boolean} includeResolved - Whether to include resolved conditions
   * @returns {Promise<Object>} Patient conditions
   */
  getPatientConditions: (patientId, includeResolved = false) =>
    apiRequest("GET", `/ehr/patients/${patientId}/conditions`, null, {
      params: { include_resolved: includeResolved },
      errorMessage: "Failed to fetch patient conditions",
    }),

  /**
   * Get patient lab results
   * @param {string} patientId - Patient ID
   * @param {string} startDate - Start date for results range (ISO format)
   * @param {string} endDate - End date for results range (ISO format)
   * @returns {Promise<Object>} Patient lab results
   */
  getPatientLabResults: (patientId, startDate = null, endDate = null) =>
    apiRequest("GET", `/ehr/patients/${patientId}/lab-results`, null, {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
      errorMessage: "Failed to fetch patient lab results",
    }),

  /**
   * Get patient vital signs
   * @param {string} patientId - Patient ID
   * @param {string} startDate - Start date for vitals range (ISO format)
   * @param {string} endDate - End date for vitals range (ISO format)
   * @returns {Promise<Object>} Patient vital signs
   */
  getPatientVitals: (patientId, startDate = null, endDate = null) =>
    apiRequest("GET", `/ehr/patients/${patientId}/vitals`, null, {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
      errorMessage: "Failed to fetch patient vital signs",
    }),

  /**
   * Get patient encounters
   * @param {string} patientId - Patient ID
   * @param {string} startDate - Start date for encounters range (ISO format)
   * @param {string} endDate - End date for encounters range (ISO format)
   * @returns {Promise<Object>} Patient encounters
   */
  getPatientEncounters: (patientId, startDate = null, endDate = null) =>
    apiRequest("GET", `/ehr/patients/${patientId}/encounters`, null, {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
      errorMessage: "Failed to fetch patient encounters",
    }),

  /**
   * Get patient immunizations
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} Patient immunizations
   */
  getPatientImmunizations: (patientId) =>
    apiRequest("GET", `/ehr/patients/${patientId}/immunizations`, null, {
      errorMessage: "Failed to fetch patient immunizations",
    }),

  /**
   * Get patient care plans
   * @param {string} patientId - Patient ID
   * @param {boolean} includeInactive - Whether to include inactive care plans
   * @returns {Promise<Object>} Patient care plans
   */
  getPatientCarePlans: (patientId, includeInactive = false) =>
    apiRequest("GET", `/ehr/patients/${patientId}/care-plans`, null, {
      params: { include_inactive: includeInactive },
      errorMessage: "Failed to fetch patient care plans",
    }),

  /**
   * Create a new patient record
   * @param {Object} patientData - Patient data
   * @returns {Promise<Object>} Created patient record
   */
  createPatient: (patientData) =>
    apiRequest("POST", "/ehr/patients", patientData, {
      errorMessage: "Failed to create patient record",
      successMessage: "Patient record created successfully",
    }),

  /**
   * Update a patient record
   * @param {string} patientId - Patient ID
   * @param {Object} patientData - Updated patient data
   * @returns {Promise<Object>} Updated patient record
   */
  updatePatient: (patientId, patientData) =>
    apiRequest("PUT", `/ehr/patients/${patientId}`, patientData, {
      errorMessage: "Failed to update patient record",
      successMessage: "Patient record updated successfully",
    }),

  /**
   * Create a new medication record
   * @param {string} patientId - Patient ID
   * @param {Object} medicationData - Medication data
   * @returns {Promise<Object>} Created medication record
   */
  createMedication: (patientId, medicationData) =>
    apiRequest("POST", `/ehr/patients/${patientId}/medications`, medicationData, {
      errorMessage: "Failed to create medication record",
      successMessage: "Medication record created successfully",
    }),

  /**
   * Create a new allergy record
   * @param {string} patientId - Patient ID
   * @param {Object} allergyData - Allergy data
   * @returns {Promise<Object>} Created allergy record
   */
  createAllergy: (patientId, allergyData) =>
    apiRequest("POST", `/ehr/patients/${patientId}/allergies`, allergyData, {
      errorMessage: "Failed to create allergy record",
      successMessage: "Allergy record created successfully",
    }),

  /**
   * Create a new condition record
   * @param {string} patientId - Patient ID
   * @param {Object} conditionData - Condition data
   * @returns {Promise<Object>} Created condition record
   */
  createCondition: (patientId, conditionData) =>
    apiRequest("POST", `/ehr/patients/${patientId}/conditions`, conditionData, {
      errorMessage: "Failed to create condition record",
      successMessage: "Condition record created successfully",
    }),

  /**
   * Export patient data to FHIR format
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} FHIR-formatted patient data
   */
  exportToFHIR: (patientId) =>
    apiRequest("GET", `/ehr/patients/${patientId}/export/fhir`, null, {
      errorMessage: "Failed to export patient data to FHIR",
    }),

  /**
   * Import FHIR data into EHR
   * @param {Object} fhirData - FHIR-formatted data
   * @returns {Promise<Object>} Import result
   */
  importFromFHIR: (fhirData) =>
    apiRequest("POST", "/ehr/import/fhir", fhirData, {
      errorMessage: "Failed to import FHIR data",
      successMessage: "FHIR data imported successfully",
    }),

  /**
   * Get FHIR service for direct FHIR operations
   */
  fhir: fhirService,
}

export default ehrService
