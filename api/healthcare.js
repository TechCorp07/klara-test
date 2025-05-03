// lib/api/healthcare.js
import { apiRequest, createApiService } from "./client"

/**
 * Healthcare API service with standard and specialized methods
 */
const baseService = createApiService("healthcare")

/**
 * Healthcare-related API functions
 */
const healthcareApi = {
  // Base CRUD operations
  ...baseService,

  /**
   * Get medical records with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated medical records
   */
  getMedicalRecords: (filters = {}) =>
    baseService.getList(filters, {
      errorMessage: "Failed to fetch medical records",
    }),

  /**
   * Get medical record by ID
   * @param {string} id - Medical record ID
   * @returns {Promise<Object>} Medical record
   */
  getMedicalRecord: (id) =>
    baseService.getById(id, {
      errorMessage: "Failed to fetch medical record",
    }),

  /**
   * Create a new medical record
   * @param {Object} recordData - Medical record data
   * @returns {Promise<Object>} Created medical record
   */
  createMedicalRecord: (recordData) =>
    baseService.create(recordData, {
      errorMessage: "Failed to create medical record",
      successMessage: "Medical record created successfully",
    }),

  /**
   * Get conditions with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated conditions
   */
  getConditions: (filters = {}) =>
    apiRequest("GET", "healthcare/conditions", null, {
      params: filters,
      errorMessage: "Failed to fetch conditions",
    }),

  /**
   * Get condition by ID
   * @param {string} id - Condition ID
   * @returns {Promise<Object>} Condition
   */
  getCondition: (id) =>
    apiRequest("GET", `healthcare/conditions/${id}`, null, {
      errorMessage: "Failed to fetch condition",
    }),

  /**
   * Get allergies with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated allergies
   */
  getAllergies: (filters = {}) =>
    apiRequest("GET", "healthcare/allergies", null, {
      params: filters,
      errorMessage: "Failed to fetch allergies",
    }),

  /**
   * Get immunizations with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated immunizations
   */
  getImmunizations: (filters = {}) =>
    apiRequest("GET", "healthcare/immunizations", null, {
      params: filters,
      errorMessage: "Failed to fetch immunizations",
    }),

  /**
   * Get lab tests with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated lab tests
   */
  getLabTests: (filters = {}) =>
    apiRequest("GET", "healthcare/lab-tests", null, {
      params: filters,
      errorMessage: "Failed to fetch lab tests",
    }),

  /**
   * Get vital signs with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated vital signs
   */
  getVitalSigns: (filters = {}) =>
    apiRequest("GET", "healthcare/vital-signs", null, {
      params: filters,
      errorMessage: "Failed to fetch vital signs",
    }),

  /**
   * Get pending approvals with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated pending approvals
   */
  getPendingApprovals: (filters = {}) =>
    apiRequest("GET", "healthcare/approvals/pending", null, {
      params: filters,
      errorMessage: "Failed to fetch pending approvals",
    }),

  /**
   * Approve a pending approval
   * @param {string} id - Approval ID
   * @param {Object} approvalData - Approval data
   * @returns {Promise<Object>} Approval response
   */
  approveRequest: (id, approvalData = {}) =>
    apiRequest("POST", `healthcare/approvals/${id}/approve`, approvalData, {
      errorMessage: "Failed to approve request",
      successMessage: "Request approved successfully",
    }),

  /**
   * Reject a pending approval
   * @param {string} id - Approval ID
   * @param {Object} rejectionData - Rejection data
   * @returns {Promise<Object>} Rejection response
   */
  rejectRequest: (id, rejectionData = {}) =>
    apiRequest("POST", `healthcare/approvals/${id}/reject`, rejectionData, {
      errorMessage: "Failed to reject request",
      successMessage: "Request rejected successfully",
    }),
}

export default healthcareApi
