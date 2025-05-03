/**
 * FHIR service for interacting with FHIR resources
 */
import apiClient from "../api-client"
import { API_ENDPOINTS } from "../config"

const fhirService = {
  /**
   * Get FHIR Patient resources
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Bundle of Patient resources
   */
  getPatients: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.FHIR.PATIENT, {
      params,
      errorMessage: "Failed to fetch patient resources",
    })
  },

  /**
   * Get a specific FHIR Patient resource
   * @param {string} id - Resource ID
   * @returns {Promise<Object>} - Patient resource
   */
  getPatientById: (id) => {
    return apiClient.get(`${API_ENDPOINTS.FHIR.PATIENT}${id}`, {
      errorMessage: "Failed to fetch patient resource",
    })
  },

  /**
   * Create a FHIR Patient resource
   * @param {Object} data - Patient resource data
   * @returns {Promise<Object>} - Created Patient resource
   */
  createPatient: (data) => {
    return apiClient.post(API_ENDPOINTS.FHIR.PATIENT, data, {
      errorMessage: "Failed to create patient resource",
      successMessage: "Patient resource created successfully",
    })
  },

  /**
   * Update a FHIR Patient resource
   * @param {string} id - Resource ID
   * @param {Object} data - Updated Patient resource data
   * @returns {Promise<Object>} - Updated Patient resource
   */
  updatePatient: (id, data) => {
    return apiClient.put(`${API_ENDPOINTS.FHIR.PATIENT}${id}`, data, {
      errorMessage: "Failed to update patient resource",
      successMessage: "Patient resource updated successfully",
    })
  },

  /**
   * Delete a FHIR Patient resource
   * @param {string} id - Resource ID
   * @returns {Promise<Object>} - Deletion result
   */
  deletePatient: (id) => {
    return apiClient.delete(`${API_ENDPOINTS.FHIR.PATIENT}${id}`, {
      errorMessage: "Failed to delete patient resource",
      successMessage: "Patient resource deleted successfully",
    })
  },

  /**
   * Get FHIR Practitioner resources
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Bundle of Practitioner resources
   */
  getPractitioners: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.FHIR.PRACTITIONER, {
      params,
      errorMessage: "Failed to fetch practitioner resources",
    })
  },

  /**
   * Get FHIR Observation resources
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Bundle of Observation resources
   */
  getObservations: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.FHIR.OBSERVATION, {
      params,
      errorMessage: "Failed to fetch observation resources",
    })
  },

  /**
   * Get FHIR Condition resources
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Bundle of Condition resources
   */
  getConditions: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.FHIR.CONDITION, {
      params,
      errorMessage: "Failed to fetch condition resources",
    })
  },

  /**
   * Get FHIR MedicationStatement resources
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Bundle of MedicationStatement resources
   */
  getMedicationStatements: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.FHIR.MEDICATION_STATEMENT, {
      params,
      errorMessage: "Failed to fetch medication statement resources",
    })
  },

  /**
   * Get FHIR Encounter resources
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Bundle of Encounter resources
   */
  getEncounters: (params = {}) => {
    return apiClient.get(API_ENDPOINTS.FHIR.ENCOUNTER, {
      params,
      errorMessage: "Failed to fetch encounter resources",
    })
  },

  /**
   * Generic method to get any FHIR resource type
   * @param {string} resourceType - FHIR resource type
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} - Bundle of resources
   */
  getResources: (resourceType, params = {}) => {
    return apiClient.get(`/fhir/${resourceType}/`, {
      params,
      errorMessage: `Failed to fetch ${resourceType} resources`,
    })
  },

  /**
   * Generic method to get a specific FHIR resource
   * @param {string} resourceType - FHIR resource type
   * @param {string} id - Resource ID
   * @returns {Promise<Object>} - Resource
   */
  getResourceById: (resourceType, id) => {
    return apiClient.get(`/fhir/${resourceType}/${id}`, {
      errorMessage: `Failed to fetch ${resourceType} resource`,
    })
  },

  /**
   * Generic method to create a FHIR resource
   * @param {string} resourceType - FHIR resource type
   * @param {Object} data - Resource data
   * @returns {Promise<Object>} - Created resource
   */
  createResource: (resourceType, data) => {
    return apiClient.post(`/fhir/${resourceType}/`, data, {
      errorMessage: `Failed to create ${resourceType} resource`,
      successMessage: `${resourceType} resource created successfully`,
    })
  },

  /**
   * Generic method to update a FHIR resource
   * @param {string} resourceType - FHIR resource type
   * @param {string} id - Resource ID
   * @param {Object} data - Updated resource data
   * @returns {Promise<Object>} - Updated resource
   */
  updateResource: (resourceType, id, data) => {
    return apiClient.put(`/fhir/${resourceType}/${id}`, data, {
      errorMessage: `Failed to update ${resourceType} resource`,
      successMessage: `${resourceType} resource updated successfully`,
    })
  },

  /**
   * Generic method to delete a FHIR resource
   * @param {string} resourceType - FHIR resource type
   * @param {string} id - Resource ID
   * @returns {Promise<Object>} - Deletion result
   */
  deleteResource: (resourceType, id) => {
    return apiClient.delete(`/fhir/${resourceType}/${id}`, {
      errorMessage: `Failed to delete ${resourceType} resource`,
      successMessage: `${resourceType} resource deleted successfully`,
    })
  },
}

export default fhirService
