/**
 * Healthcare service for medical data and operations
 */
import apiClient from "../api-client"
import { API_ENDPOINTS } from "../config"

const healthcareService = {
  /**
   * Get medical records for a patient
   * @param {Object} params - Query parameters (e.g., patient_id)
   * @returns {Promise<Object>} - Medical records data
   */
  getMedicalRecords: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.HEALTHCARE.MEDICAL_RECORDS, {
      params,
      errorMessage: "Failed to fetch medical records",
    })
  },

  /**
   * Get a specific medical record
   * @param {string} recordId - Medical record ID
   * @returns {Promise<Object>} - Medical record data
   */
  getMedicalRecordById: (recordId) => {
    return apiClient.get(API_ENDPOINTS.HEALTHCARE.MEDICAL_RECORD(recordId), {
      errorMessage: "Failed to fetch medical record",
    })
  },

  /**
   * Create medical record
   * @param {Object} data - Medical record data
   * @returns {Promise<Object>} - Created medical record
   */
  createMedicalRecord: (data) => {
    return apiClient.post(API_ENDPOINTS.HEALTHCARE.MEDICAL_RECORDS, data, {
      errorMessage: "Failed to create medical record",
      successMessage: "Medical record created successfully",
    })
  },

  /**
   * Update medical record
   * @param {string} recordId - Medical record ID
   * @param {Object} data - Updated medical record data
   * @returns {Promise<Object>} - Updated medical record
   */
  updateMedicalRecord: (recordId, data) => {
    return apiClient.put(API_ENDPOINTS.HEALTHCARE.MEDICAL_RECORD(recordId), data, {
      errorMessage: "Failed to update medical record",
      successMessage: "Medical record updated successfully",
    })
  },

  /**
   * Delete medical record
   * @param {string} recordId - Medical record ID
   * @returns {Promise<Object>} - Deletion response
   */
  deleteMedicalRecord: (recordId) => {
    return apiClient.delete(API_ENDPOINTS.HEALTHCARE.MEDICAL_RECORD(recordId), {
      errorMessage: "Failed to delete medical record",
      successMessage: "Medical record deleted successfully",
    })
  },

  /**
   * Get conditions for a patient
   * @param {Object} params - Query parameters (e.g., medical_record_id)
   * @returns {Promise<Object>} - Conditions data
   */
  getConditions: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.HEALTHCARE.CONDITIONS, {
      params,
      errorMessage: "Failed to fetch conditions",
    })
  },

  /**
   * Get a specific condition
   * @param {string} conditionId - Condition ID
   * @returns {Promise<Object>} - Condition data
   */
  getConditionById: (conditionId) => {
    return apiClient.get(API_ENDPOINTS.HEALTHCARE.CONDITION(conditionId), {
      errorMessage: "Failed to fetch condition",
    })
  },

  /**
   * Create condition
   * @param {Object} data - Condition data
   * @returns {Promise<Object>} - Created condition
   */
  createCondition: (data) => {
    return apiClient.post(API_ENDPOINTS.HEALTHCARE.CONDITIONS, data, {
      errorMessage: "Failed to create condition",
      successMessage: "Condition created successfully",
    })
  },

  /**
   * Update condition
   * @param {string} conditionId - Condition ID
   * @param {Object} data - Updated condition data
   * @returns {Promise<Object>} - Updated condition
   */
  updateCondition: (conditionId, data) => {
    return apiClient.put(API_ENDPOINTS.HEALTHCARE.CONDITION(conditionId), data, {
      errorMessage: "Failed to update condition",
      successMessage: "Condition updated successfully",
    })
  },

  /**
   * Delete condition
   * @param {string} conditionId - Condition ID
   * @returns {Promise<Object>} - Deletion response
   */
  deleteCondition: (conditionId) => {
    return apiClient.delete(API_ENDPOINTS.HEALTHCARE.CONDITION(conditionId), {
      errorMessage: "Failed to delete condition",
      successMessage: "Condition deleted successfully",
    })
  },

  /**
   * Get rare conditions registry
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Rare conditions data
   */
  getRareConditions: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.HEALTHCARE.RARE_CONDITIONS, {
      params,
      errorMessage: "Failed to fetch rare conditions",
    })
  },

  /**
   * Get vital signs for a patient
   * @param {Object} params - Query parameters (e.g., patient_id, date_range)
   * @returns {Promise<Object>} - Vital signs data
   */
  getVitalSigns: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.HEALTHCARE.VITAL_SIGNS, {
      params,
      errorMessage: "Failed to fetch vital signs",
    })
  },

  /**
   * Get lab results for a patient
   * @param {Object} params - Query parameters (e.g., patient_id, test_type)
   * @returns {Promise<Object>} - Lab results data
   */
  getLabResults: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.HEALTHCARE.LAB_RESULTS, {
      params,
      errorMessage: "Failed to fetch lab results",
    })
  },

  /**
   * Get allergies for a patient
   * @param {Object} params - Query parameters (e.g., patient_id)
   * @returns {Promise<Object>} - Allergies data
   */
  getAllergies: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.HEALTHCARE.ALLERGIES, {
      params,
      errorMessage: "Failed to fetch allergies",
    })
  },

  /**
   * Get treatments for a patient
   * @param {Object} params - Query parameters (e.g., patient_id, condition_id)
   * @returns {Promise<Object>} - Treatments data
   */
  getTreatments: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.HEALTHCARE.TREATMENTS, {
      params,
      errorMessage: "Failed to fetch treatments",
    })
  },

  /**
   * Get family history for a patient
   * @param {Object} params - Query parameters (e.g., patient_id)
   * @returns {Promise<Object>} - Family history data
   */
  getFamilyHistory: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.HEALTHCARE.FAMILY_HISTORY, {
      params,
      errorMessage: "Failed to fetch family history",
    })
  },

  /**
   * Get health data consents for a patient
   * @param {Object} params - Query parameters (e.g., patient_id)
   * @returns {Promise<Object>} - Health data consents
   */
  getHealthDataConsents: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.HEALTHCARE.HEALTH_DATA_CONSENTS, {
      params,
      errorMessage: "Failed to fetch health data consents",
    })
  },

  /**
   * Get referral network providers
   * @param {Object} params - Query parameters (e.g., specialty, location)
   * @returns {Promise<Object>} - Referral network data
   */
  getReferralNetwork: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.HEALTHCARE.REFERRAL_NETWORK, {
      params,
      errorMessage: "Failed to fetch referral network",
    })
  },
}

export default healthcareService
