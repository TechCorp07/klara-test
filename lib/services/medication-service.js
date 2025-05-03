/**
 * Medication service for medication-related operations
 */
import apiClient from "../api-client"
import { API_ENDPOINTS } from "../config"

const medicationService = {
  /**
   * Get list of medications
   * @param {Object} params - Query parameters (e.g., patient_id, status)
   * @returns {Promise<Object>} - Paginated medications
   */
  getMedications: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.MEDICATION.MEDICATIONS, {
      params,
      errorMessage: "Failed to fetch medications",
    })
  },

  /**
   * Get a specific medication by ID
   * @param {string} medicationId - Medication ID
   * @returns {Promise<Object>} - Medication details
   */
  getMedicationById: (medicationId) => {
    return apiClient.get(API_ENDPOINTS.MEDICATION.MEDICATION(medicationId), {
      errorMessage: "Failed to fetch medication details",
    })
  },

  /**
   * Create a new medication record
   * @param {Object} data - Medication data
   * @returns {Promise<Object>} - Created medication record
   */
  createMedication: (data) => {
    return apiClient.post(API_ENDPOINTS.MEDICATION.MEDICATIONS, data, {
      errorMessage: "Failed to create medication record",
      successMessage: "Medication record created successfully",
    })
  },

  /**
   * Update a medication record
   * @param {string} medicationId - Medication ID
   * @param {Object} data - Updated medication data
   * @returns {Promise<Object>} - Updated medication record
   */
  updateMedication: (medicationId, data) => {
    return apiClient.put(API_ENDPOINTS.MEDICATION.MEDICATION(medicationId), data, {
      errorMessage: "Failed to update medication record",
      successMessage: "Medication record updated successfully",
    })
  },

  /**
   * Delete a medication record
   * @param {string} medicationId - Medication ID
   * @returns {Promise<Object>} - Deletion result
   */
  deleteMedication: (medicationId) => {
    return apiClient.delete(API_ENDPOINTS.MEDICATION.MEDICATION(medicationId), {
      errorMessage: "Failed to delete medication record",
      successMessage: "Medication record deleted successfully",
    })
  },

  /**
   * Get medication adherence data
   * @param {Object} params - Query parameters (e.g., patient_id, medication_id, date_range)
   * @returns {Promise<Object>} - Adherence data
   */
  getAdherence: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.MEDICATION.ADHERENCE, {
      params,
      errorMessage: "Failed to fetch medication adherence data",
    })
  },

  /**
   * Get medication reminders
   * @param {Object} params - Query parameters (e.g., patient_id)
   * @returns {Promise<Object>} - Reminder data
   */
  getReminders: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.MEDICATION.REMINDERS, {
      params,
      errorMessage: "Failed to fetch medication reminders",
    })
  },

  /**
   * Get potential medication interactions
   * @param {Object} params - Query parameters (e.g., patient_id, medications list)
   * @returns {Promise<Object>} - Interaction data
   */
  getInteractions: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.MEDICATION.INTERACTIONS, {
      params,
      errorMessage: "Failed to fetch medication interactions",
    })
  },

  /**
   * Get reported side effects
   * @param {Object} params - Query parameters (e.g., patient_id, medication_id)
   * @returns {Promise<Object>} - Side effects data
   */
  getSideEffects: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.MEDICATION.SIDE_EFFECTS, {
      params,
      errorMessage: "Failed to fetch medication side effects",
    })
  },

  /**
   * Create a medication adherence record
   * @param {Object} data - Adherence data
   * @returns {Promise<Object>} - Created adherence record
   */
  createAdherenceRecord: (data) => {
    return apiClient.post(API_ENDPOINTS.MEDICATION.ADHERENCE, data, {
      errorMessage: "Failed to record medication adherence",
      successMessage: "Medication adherence recorded successfully",
    })
  },

  /**
   * Create a medication reminder
   * @param {Object} data - Reminder data
   * @returns {Promise<Object>} - Created reminder
   */
  createReminder: (data) => {
    return apiClient.post(API_ENDPOINTS.MEDICATION.REMINDERS, data, {
      errorMessage: "Failed to create medication reminder",
      successMessage: "Medication reminder created successfully",
    })
  },

  /**
   * Report a medication side effect
   * @param {Object} data - Side effect data
   * @returns {Promise<Object>} - Created side effect report
   */
  reportSideEffect: (data) => {
    return apiClient.post(API_ENDPOINTS.MEDICATION.SIDE_EFFECTS, data, {
      errorMessage: "Failed to report side effect",
      successMessage: "Side effect reported successfully",
    })
  },
}

export default medicationService
