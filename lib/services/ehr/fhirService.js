/**
 * FHIR service for interacting with FHIR-compliant APIs
 * Updated to align with documented backend endpoints
 */

import { apiRequest } from '../../../api/client';

/**
 * FHIR service that provides access to FHIR resources and operations
 */
export const fhirService = {
  /**
   * Get a FHIR resource by ID
   * @param {string} resourceType - FHIR resource type (Patient, Observation, etc.)
   * @param {string} id - Resource ID
   * @param {Object} options - Request options
   * @returns {Promise<Object>} FHIR resource
   */
  get: (resourceType, id, options = {}) => 
    apiRequest('GET', `/fhir/${resourceType}/${id}`, null, {
      errorMessage: `Failed to fetch ${resourceType}`,
      ...options
    }),
  
  /**
   * Search for FHIR resources
   * @param {string} resourceType - FHIR resource type (Patient, Observation, etc.)
   * @param {Object} searchParams - Search parameters
   * @param {Object} options - Request options
   * @returns {Promise<Object>} FHIR search bundle
   */
  search: (resourceType, searchParams, options = {}) => 
    apiRequest('GET', `/fhir/${resourceType}`, null, {
      params: searchParams,
      errorMessage: `Failed to search ${resourceType} resources`,
      ...options
    }),
  
  /**
   * Create a FHIR resource
   * @param {string} resourceType - FHIR resource type (Patient, Observation, etc.)
   * @param {Object} resource - FHIR resource data
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Created FHIR resource
   */
  create: (resourceType, resource, options = {}) => 
    apiRequest('POST', `/fhir/${resourceType}`, resource, {
      errorMessage: `Failed to create ${resourceType}`,
      successMessage: `${resourceType} created successfully`,
      ...options
    }),
  
  /**
   * Update a FHIR resource
   * @param {string} resourceType - FHIR resource type (Patient, Observation, etc.)
   * @param {string} id - Resource ID
   * @param {Object} resource - FHIR resource data
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Updated FHIR resource
   */
  update: (resourceType, id, resource, options = {}) => 
    apiRequest('PUT', `/fhir/${resourceType}/${id}`, resource, {
      errorMessage: `Failed to update ${resourceType}`,
      successMessage: `${resourceType} updated successfully`,
      ...options
    }),
  
  /**
   * Delete a FHIR resource
   * @param {string} resourceType - FHIR resource type (Patient, Observation, etc.)
   * @param {string} id - Resource ID
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Deletion response
   */
  delete: (resourceType, id, options = {}) => 
    apiRequest('DELETE', `/fhir/${resourceType}/${id}`, null, {
      errorMessage: `Failed to delete ${resourceType}`,
      successMessage: `${resourceType} deleted successfully`,
      ...options
    }),
  
  /**
   * Execute a FHIR operation
   * @param {string} resourceType - FHIR resource type (Patient, Observation, etc.)
   * @param {string} id - Resource ID (optional, pass null for type-level operations)
   * @param {string} operation - Operation name (without $ prefix)
   * @param {string} method - HTTP method (GET, POST)
   * @param {Object} parameters - Operation parameters (for POST)
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Operation result
   */
  operation: (resourceType, id, operation, method = 'POST', parameters = null, options = {}) => {
    const path = id 
      ? `/fhir/${resourceType}/${id}/$${operation}`
      : `/fhir/${resourceType}/$${operation}`;
    
    return apiRequest(method, path, parameters, {
      errorMessage: `Failed to execute ${operation} on ${resourceType}`,
      ...options
    });
  },
  
  /**
   * Get a patient's FHIR resources
   * @param {string} patientId - Patient ID
   * @param {string} resourceType - FHIR resource type (Observation, MedicationStatement, etc.)
   * @param {Object} additionalParams - Additional search parameters
   * @param {Object} options - Request options
   * @returns {Promise<Object>} FHIR search bundle
   */
  getPatientResources: (patientId, resourceType, additionalParams = {}, options = {}) => 
    apiRequest('GET', `/fhir/${resourceType}`, null, {
      params: {
        patient: patientId,
        ...additionalParams
      },
      errorMessage: `Failed to fetch patient ${resourceType} resources`,
      ...options
    }),
  
  /**
   * Get a patient's complete record (all resource types)
   * @param {string} patientId - Patient ID
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Patient record bundle
   */
  getPatientEverything: (patientId, options = {}) => 
    apiRequest('GET', `/fhir/Patient/${patientId}/$everything`, null, {
      errorMessage: 'Failed to fetch complete patient record',
      ...options
    }),
  
  /**
   * Export FHIR data
   * @param {string} exportType - Export type ('system', 'patient', 'group')
   * @param {string} id - ID for patient or group export (required for those types)
   * @param {Object} parameters - Export parameters
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Export response
   */
  export: (exportType, id = null, parameters = {}, options = {}) => {
    let path;
    switch (exportType) {
      case 'patient':
        if (!id) throw new Error('Patient ID is required for patient export');
        path = `/fhir/Patient/${id}/$export`;
        break;
      case 'group':
        if (!id) throw new Error('Group ID is required for group export');
        path = `/fhir/Group/${id}/$export`;
        break;
      case 'system':
      default:
        path = '/fhir/$export';
        break;
    }
    
    return apiRequest('GET', path, null, {
      params: parameters,
      errorMessage: 'Failed to initiate FHIR export',
      ...options
    });
  },
  
  /**
   * Convert data to FHIR format
   * @param {string} sourceFormat - Source format (hl7, ccda, etc.)
   * @param {Object} data - Data to convert
   * @param {Object} options - Request options
   * @returns {Promise<Object>} FHIR resources
   */
  convert: (sourceFormat, data, options = {}) => 
    apiRequest('POST', `/fhir/convert/${sourceFormat}`, data, {
      errorMessage: `Failed to convert ${sourceFormat} to FHIR`,
      ...options
    }),
  
  /**
   * Validate a FHIR resource
   * @param {string} resourceType - FHIR resource type
   * @param {Object} resource - FHIR resource to validate
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Validation result
   */
  validate: (resourceType, resource, options = {}) => 
    apiRequest('POST', `/fhir/${resourceType}/$validate`, resource, {
      errorMessage: 'FHIR resource validation failed',
      ...options
    }),
    
  /**
   * Perform a FHIR transaction (bundle of operations)
   * @param {Object} bundle - FHIR Bundle resource with type='transaction'
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Transaction result bundle
   */
  transaction: (bundle, options = {}) => {
    // Ensure bundle has transaction type
    const transactionBundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      ...bundle,
    };
    
    if (transactionBundle.type !== 'transaction') {
      transactionBundle.type = 'transaction';
    }
    
    return apiRequest('POST', '/fhir', transactionBundle, {
      errorMessage: 'FHIR transaction failed',
      ...options
    });
  }
};

export default fhirService;
