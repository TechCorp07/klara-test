// lib/services/medicationService.js
// Service wrapper for medication API
// Updated based on API documentation analysis

import { apiRequest } from "@/api/client";

/**
 * Medication service that provides access to medication-related API functions
 */
export const medicationService = {
  /**
   * Get list of medications (Aligned with GET /medication/medications)
   * @param {Object} params - Query parameters (e.g., patient_id, status)
   * @returns {Promise<Object>} Paginated medications
   */
  getMedications: (params = {}) => 
    apiRequest("GET", "/medication/medications", params, {
      errorMessage: "Failed to fetch medications",
    }),

  /**
   * Get a specific medication by ID (Aligned with GET /medication/medications/*)
   * @param {string} medicationId - Medication ID
   * @returns {Promise<Object>} Medication details
   */
  getMedicationById: (medicationId) =>
    apiRequest("GET", `/medication/medications/${medicationId}`, null, {
      errorMessage: "Failed to fetch medication details",
    }),

  /**
   * Create a new medication record (Aligned with POST /medication/medications)
   * @param {Object} data - Medication data
   * @returns {Promise<Object>} Created medication record
   */
  createMedication: (data) =>
    apiRequest("POST", "/medication/medications", data, {
      errorMessage: "Failed to create medication record",
      successMessage: "Medication record created successfully",
    }),

  /**
   * Update a medication record (Aligned with PUT /medication/medications/*)
   * @param {string} medicationId - Medication ID
   * @param {Object} data - Updated medication data
   * @returns {Promise<Object>} Updated medication record
   */
  updateMedication: (medicationId, data) =>
    apiRequest("PUT", `/medication/medications/${medicationId}`, data, {
      errorMessage: "Failed to update medication record",
      successMessage: "Medication record updated successfully",
    }),

  /**
   * Delete a medication record (Aligned with DELETE /medication/medications/*)
   * @param {string} medicationId - Medication ID
   * @returns {Promise<Object>} Deletion result
   */
  deleteMedication: (medicationId) =>
    apiRequest("DELETE", `/medication/medications/${medicationId}`, null, {
      errorMessage: "Failed to delete medication record",
      successMessage: "Medication record deleted successfully",
    }),

  /**
   * Get medication adherence data (Aligned with GET /medication/adherence)
   * @param {Object} params - Query parameters (e.g., patient_id, medication_id, date_range)
   * @returns {Promise<Object>} Adherence data
   */
  getAdherence: (params = {}) =>
    apiRequest("GET", "/medication/adherence", params, {
      errorMessage: "Failed to fetch medication adherence data",
    }),

  /**
   * Get medication reminders (Aligned with GET /medication/reminders)
   * @param {Object} params - Query parameters (e.g., patient_id)
   * @returns {Promise<Object>} Reminder data
   */
  getReminders: (params = {}) =>
    apiRequest("GET", "/medication/reminders", params, {
      errorMessage: "Failed to fetch medication reminders",
    }),

  /**
   * Get potential medication interactions (Aligned with GET /medication/interactions)
   * @param {Object} params - Query parameters (e.g., patient_id, medications list)
   * @returns {Promise<Object>} Interaction data
   */
  getInteractions: (params = {}) =>
    apiRequest("GET", "/medication/interactions", params, {
      errorMessage: "Failed to fetch medication interactions",
    }),

  /**
   * Get reported side effects (Aligned with GET /medication/side-effects)
   * @param {Object} params - Query parameters (e.g., patient_id, medication_id)
   * @returns {Promise<Object>} Side effects data
   */
  getSideEffects: (params = {}) =>
    apiRequest("GET", "/medication/side-effects", params, {
      errorMessage: "Failed to fetch medication side effects",
    }),

  // NOTE: The original `requestRefill` function pointed to a `/refill` sub-endpoint
  // which is not present in the backend documentation. The documentation only includes
  // standard CRUD operations for `/medication/medications/*`.
  // Refill functionality might be handled by updating the medication record itself
  // or requires clarification from the backend team.
  // requestRefill: (medicationId, refillData = {}) =>
  //   apiRequest("PUT", `/medication/medications/${medicationId}`, { /* refill data */ }, {
  //     errorMessage: "Failed to request refill",
  //     successMessage: "Refill requested successfully",
  //   }),
};

export default medicationService;

