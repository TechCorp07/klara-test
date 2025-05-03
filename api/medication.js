// api/medication.js - Updated to align with backend API
import { apiRequest } from "./client"

/**
 * Medication API service
 * Handles medication management and related operations
 */
const medicationAPI = {
  /**
   * Get all medications for a patient
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} List of medications
   */
  getPatientMedications: (patientId) =>
    apiRequest("GET", `medications`, null, {
      params: { patientId },
      errorMessage: "Failed to fetch patient medications",
    }),

  /**
   * Get medication details
   * @param {string} medicationId - Medication ID
   * @returns {Promise<Object>} Medication details
   */
  getMedication: (medicationId) =>
    apiRequest("GET", `medications/${medicationId}`.replace("${medicationId}", medicationId), null, {
      errorMessage: "Failed to fetch medication details",
    }),

  /**
   * Create a new medication
   * @param {Object} medicationData - Medication data
   * @returns {Promise<Object>} Created medication
   */
  createMedication: (medicationData) =>
    apiRequest("POST", "medications", medicationData, {
      errorMessage: "Failed to create medication",
      successMessage: "Medication created successfully",
    }),

  /**
   * Update a medication
   * @param {string} medicationId - Medication ID
   * @param {Object} medicationData - Updated medication data
   * @returns {Promise<Object>} Updated medication
   */
  updateMedication: (medicationId, medicationData) =>
    apiRequest("PUT", `medications/${medicationId}`.replace("${medicationId}", medicationId), medicationData, {
      errorMessage: "Failed to update medication",
      successMessage: "Medication updated successfully",
    }),

  /**
   * Delete a medication
   * @param {string} medicationId - Medication ID
   * @returns {Promise<Object>} Deletion response
   */
  deleteMedication: (medicationId) =>
    apiRequest("DELETE", `medications/${medicationId}`.replace("${medicationId}", medicationId), null, {
      errorMessage: "Failed to delete medication",
      successMessage: "Medication deleted successfully",
    }),

  /**
   * Request medication refill
   * @param {string} medicationId - Medication ID
   * @param {Object} refillData - Refill request data
   * @returns {Promise<Object>} Refill request response
   */
  requestRefill: (medicationId, refillData) =>
    apiRequest(
      "POST",
      `medications/reminders`,
      { ...refillData, medicationId },
      {
        errorMessage: "Failed to request medication refill",
        successMessage: "Refill request submitted successfully",
      },
    ),

  /**
   * Get medication adherence data
   * @param {string} patientId - Patient ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Adherence data
   */
  getAdherenceData: (patientId, params = {}) =>
    apiRequest("GET", `medications/adherence`, null, {
      params: { ...params, patientId },
      errorMessage: "Failed to fetch medication adherence data",
    }),

  /**
   * Record medication intake
   * @param {string} medicationId - Medication ID
   * @param {Object} intakeData - Intake data
   * @returns {Promise<Object>} Intake record
   */
  recordIntake: (medicationId, intakeData) =>
    apiRequest(
      "POST",
      `medications/adherence`,
      { ...intakeData, medicationId },
      {
        errorMessage: "Failed to record medication intake",
        successMessage: "Medication intake recorded successfully",
      },
    ),

  /**
   * Get medication schedule
   * @param {string} patientId - Patient ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Medication schedule
   */
  getMedicationSchedule: (patientId, params = {}) =>
    apiRequest("GET", `medications/reminders`, null, {
      params: { ...params, patientId },
      errorMessage: "Failed to fetch medication schedule",
    }),
}

export default medicationAPI
