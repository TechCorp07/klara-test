// lib/api/healthcare.js
import apiClient, { buildParams } from '@/client';

/**
 * Healthcare-related API functions
 */
const healthcareApi = {
  /**
   * Get medical record by ID
   * @param {string} id - Medical record ID
   * @returns {Promise<Object>} Medical record
   */
  getMedicalRecord: async (id) => {
    const { data } = await apiClient.get(`/healthcare/medical-records/${id}/`);
    return data;
  },
  
  /**
   * Get medical records with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated medical records
   */
  getMedicalRecords: async (filters = {}) => {
    const params = buildParams(filters);
    const { data } = await apiClient.get(`/healthcare/medical-records/?${params}`);
    return data;
  },
  
  /**
   * Create a new medical record
   * @param {Object} recordData - Medical record data
   * @returns {Promise<Object>} Created medical record
   */
  createMedicalRecord: async (recordData) => {
    const { data } = await apiClient.post('/healthcare/medical-records/', recordData);
    return data;
  },
  
  /**
   * Update a medical record
   * @param {string} id - Medical record ID
   * @param {Object} recordData - Updated medical record data
   * @returns {Promise<Object>} Updated medical record
   */
  updateMedicalRecord: async (id, recordData) => {
    const { data } = await apiClient.put(`/healthcare/medical-records/${id}/`, recordData);
    return data;
  },
  
  /**
   * Delete a medical record
   * @param {string} id - Medical record ID
   * @returns {Promise<Object>} Deletion response
   */
  deleteMedicalRecord: async (id) => {
    const { data } = await apiClient.delete(`/healthcare/medical-records/${id}/`);
    return data;
  },
  
  /**
   * Get conditions with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated conditions
   */
  getConditions: async (filters = {}) => {
    const params = buildParams(filters);
    const { data } = await apiClient.get(`/healthcare/conditions/?${params}`);
    return data;
  },
  
  /**
   * Get condition by ID
   * @param {string} id - Condition ID
   * @returns {Promise<Object>} Condition
   */
  getCondition: async (id) => {
    const { data } = await apiClient.get(`/healthcare/conditions/${id}/`);
    return data;
  },
  
  /**
   * Create a new condition
   * @param {Object} conditionData - Condition data
   * @returns {Promise<Object>} Created condition
   */
  createCondition: async (conditionData) => {
    const { data } = await apiClient.post('/healthcare/conditions/', conditionData);
    return data;
  },
  
  /**
   * Update a condition
   * @param {string} id - Condition ID
   * @param {Object} conditionData - Updated condition data
   * @returns {Promise<Object>} Updated condition
   */
  updateCondition: async (id, conditionData) => {
    const { data } = await apiClient.put(`/healthcare/conditions/${id}/`, conditionData);
    return data;
  },
  
  /**
   * Delete a condition
   * @param {string} id - Condition ID
   * @returns {Promise<Object>} Deletion response
   */
  deleteCondition: async (id) => {
    const { data } = await apiClient.delete(`/healthcare/conditions/${id}/`);
    return data;
  },
  
  /**
   * Get allergies with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated allergies
   */
  getAllergies: async (filters = {}) => {
    const params = buildParams(filters);
    const { data } = await apiClient.get(`/healthcare/allergies/?${params}`);
    return data;
  },
  
  /**
   * Get immunizations with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated immunizations
   */
  getImmunizations: async (filters = {}) => {
    const params = buildParams(filters);
    const { data } = await apiClient.get(`/healthcare/immunizations/?${params}`);
    return data;
  },
  
  /**
   * Get lab tests with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated lab tests
   */
  getLabTests: async (filters = {}) => {
    const params = buildParams(filters);
    const { data } = await apiClient.get(`/healthcare/lab-tests/?${params}`);
    return data;
  },
  
  /**
   * Get lab test by ID
   * @param {string} id - Lab test ID
   * @returns {Promise<Object>} Lab test
   */
  getLabTest: async (id) => {
    const { data } = await apiClient.get(`/healthcare/lab-tests/${id}/`);
    return data;
  },
  
  /**
   * Get lab results with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated lab results
   */
  getLabResults: async (filters = {}) => {
    const params = buildParams(filters);
    const { data } = await apiClient.get(`/healthcare/lab-results/?${params}`);
    return data;
  },
  
  /**
   * Get vital signs with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated vital signs
   */
  getVitalSigns: async (filters = {}) => {
    const params = buildParams(filters);
    const { data } = await apiClient.get(`/healthcare/vital-signs/?${params}`);
    return data;
  },
  
  /**
   * Get rare conditions with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated rare conditions
   */
  getRareConditions: async (filters = {}) => {
    const params = buildParams(filters);
    const { data } = await apiClient.get(`/healthcare/rare-conditions/?${params}`);
    return data;
  },
  
  /**
   * Get rare condition by ID
   * @param {string} id - Rare condition ID
   * @returns {Promise<Object>} Rare condition
   */
  getRareCondition: async (id) => {
    const { data } = await apiClient.get(`/healthcare/rare-conditions/${id}/`);
    return data;
  },
  
  /**
   * Get pending approvals with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated pending approvals
   */
  getPendingApprovals: async (filters = {}) => {
    const params = buildParams(filters);
    const { data } = await apiClient.get(`/healthcare/approvals/pending/?${params}`);
    return data;
  },
  
  /**
   * Approve a pending approval
   * @param {string} id - Approval ID
   * @param {Object} approvalData - Approval data
   * @returns {Promise<Object>} Approval response
   */
  approveRequest: async (id, approvalData = {}) => {
    const { data } = await apiClient.post(`/healthcare/approvals/${id}/approve/`, approvalData);
    return data;
  },
  
  /**
   * Reject a pending approval
   * @param {string} id - Approval ID
   * @param {Object} rejectionData - Rejection data
   * @returns {Promise<Object>} Rejection response
   */
  rejectRequest: async (id, rejectionData = {}) => {
    const { data } = await apiClient.post(`/healthcare/approvals/${id}/reject/`, rejectionData);
    return data;
  }
};

export default healthcareApi;