/**
 * FHIR service for interacting with FHIR-compliant APIs
 */

import { apiRequest } from "../../../api/client"

/**
 * FHIR service that provides access to FHIR resources and operations
 */
export const fhirService = {
  /**
   * Get a FHIR resource by ID
   * @param {string} resourceType - FHIR resource type (Patient, Observation, etc.)
   * @param {string} id - Resource ID
   * @returns {Promise<Object>} FHIR resource
   */
  getResource: (resourceType, id) =>
    apiRequest("GET", `/fhir/${resourceType}/${id}`, null, {
      errorMessage: `Failed to fetch ${resourceType}`,
    }),

  /**
   * Search for FHIR resources
   * @param {string} resourceType - FHIR resource type (Patient, Observation, etc.)
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} FHIR search bundle
   */
  searchResources: (resourceType, searchParams) =>
    apiRequest("GET", `/fhir/${resourceType}`, null, {
      params: searchParams,
      errorMessage: `Failed to search ${resourceType} resources`,
    }),

  /**
   * Create a FHIR resource
   * @param {string} resourceType - FHIR resource type (Patient, Observation, etc.)
   * @param {Object} resource - FHIR resource data
   * @returns {Promise<Object>} Created FHIR resource
   */
  createResource: (resourceType, resource) =>
    apiRequest("POST", `/fhir/${resourceType}`, resource, {
      errorMessage: `Failed to create ${resourceType}`,
      successMessage: `${resourceType} created successfully`,
    }),

  /**
   * Update a FHIR resource
   * @param {string} resourceType - FHIR resource type (Patient, Observation, etc.)
   * @param {string} id - Resource ID
   * @param {Object} resource - FHIR resource data
   * @returns {Promise<Object>} Updated FHIR resource
   */
  updateResource: (resourceType, id, resource) =>
    apiRequest("PUT", `/fhir/${resourceType}/${id}`, resource, {
      errorMessage: `Failed to update ${resourceType}`,
      successMessage: `${resourceType} updated successfully`,
    }),

  /**
   * Delete a FHIR resource
   * @param {string} resourceType - FHIR resource type (Patient, Observation, etc.)
   * @param {string} id - Resource ID
   * @returns {Promise<Object>} Deletion response
   */
  deleteResource: (resourceType, id) =>
    apiRequest("DELETE", `/fhir/${resourceType}/${id}`, null, {
      errorMessage: `Failed to delete ${resourceType}`,
      successMessage: `${resourceType} deleted successfully`,
    }),

  /**
   * Execute a FHIR operation
   * @param {string} resourceType - FHIR resource type (Patient, Observation, etc.)
   * @param {string} id - Resource ID (optional)
   * @param {string} operation - Operation name
   * @param {Object} parameters - Operation parameters
   * @returns {Promise<Object>} Operation result
   */
  executeOperation: (resourceType, id, operation, parameters) => {
    const path = id ? `/fhir/${resourceType}/${id}/$${operation}` : `/fhir/${resourceType}/$${operation}`

    return apiRequest("POST", path, parameters, {
      errorMessage: `Failed to execute ${operation} on ${resourceType}`,
    })
  },

  /**
   * Get a patient's FHIR resources
   * @param {string} patientId - Patient ID
   * @param {string} resourceType - FHIR resource type (Observation, MedicationStatement, etc.)
   * @param {Object} additionalParams - Additional search parameters
   * @returns {Promise<Object>} FHIR search bundle
   */
  getPatientResources: (patientId, resourceType, additionalParams = {}) =>
    apiRequest("GET", `/fhir/${resourceType}`, null, {
      params: {
        patient: patientId,
        ...additionalParams,
      },
      errorMessage: `Failed to fetch patient ${resourceType} resources`,
    }),

  /**
   * Get a patient's complete record (all resource types)
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} Patient record bundle
   */
  getPatientRecord: (patientId) =>
    apiRequest("GET", `/fhir/Patient/${patientId}/$everything`, null, {
      errorMessage: "Failed to fetch complete patient record",
    }),

  /**
   * Export FHIR data
   * @param {string} exportType - Export type (system, patient, group)
   * @param {string} id - ID for patient or group export
   * @param {Object} parameters - Export parameters
   * @returns {Promise<Object>} Export response
   */
  exportData: (exportType, id = null, parameters = {}) => {
    let path
    switch (exportType) {
      case "patient":
        path = `/fhir/Patient/${id}/$export`
        break
      case "group":
        path = `/fhir/Group/${id}/$export`
        break
      case "system":
      default:
        path = "/fhir/$export"
        break
    }

    return apiRequest("GET", path, null, {
      params: parameters,
      errorMessage: "Failed to initiate FHIR export",
    })
  },

  /**
   * Check export status
   * @param {string} statusUrl - Status URL from export response
   * @returns {Promise<Object>} Export status
   */
  checkExportStatus: (statusUrl) =>
    apiRequest("GET", statusUrl, null, {
      errorMessage: "Failed to check export status",
    }),

  /**
   * Convert data to FHIR format
   * @param {string} sourceFormat - Source format (hl7, ccda, etc.)
   * @param {Object} data - Data to convert
   * @returns {Promise<Object>} FHIR resources
   */
  convertToFHIR: (sourceFormat, data) =>
    apiRequest("POST", `/fhir/convert/${sourceFormat}`, data, {
      errorMessage: `Failed to convert ${sourceFormat} to FHIR`,
    }),

  /**
   * Validate a FHIR resource
   * @param {string} resourceType - FHIR resource type
   * @param {Object} resource - FHIR resource to validate
   * @returns {Promise<Object>} Validation result
   */
  validateResource: (resourceType, resource) =>
    apiRequest("POST", `/fhir/${resourceType}/$validate`, resource, {
      errorMessage: "FHIR resource validation failed",
    }),
}

export default fhirService
