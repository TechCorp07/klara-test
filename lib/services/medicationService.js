// lib/services/medicationService.js
// Service wrapper for medication API

import medicationApi from "../../api/index"

/**
 * Medication service that provides access to medication-related API functions
 */
export const medication = {
  ...medicationApi.medication,

  // Add any additional service-specific logic here

  /**
   * Get medications for a patient
   * @param {Object} filters - Filter parameters including patient ID
   * @returns {Promise<Object>} Paginated medications
   */
  getMedications: (filters = {}) =>
    medicationApi.medication.getList(filters, {
      errorMessage: "Failed to fetch medications",
    }),

  /**
   * Request medication refill
   * @param {string} medicationId - Medication ID
   * @param {Object} refillData - Refill request data
   * @returns {Promise<Object>} Refill request response
   */
  requestRefill: (medicationId, refillData = {}) =>
    medicationApi.medication.update(`${medicationId}/refill`, refillData, {
      errorMessage: "Failed to request refill",
      successMessage: "Refill requested successfully",
    }),
}

export default medication
