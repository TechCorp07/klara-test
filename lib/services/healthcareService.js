"use client"

import { apiRequest } from "@/api/client"

/**
 * Healthcare service for medical data and operations
 */
export const healthcare = {
  /**
   * Get pending approvals
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Pending approvals data
   */
  getPendingApprovals: (params = {}) =>
    apiRequest("GET", "/healthcare/pending-approvals", params, {
      errorMessage: "Failed to fetch pending approvals",
    }),

  /**
   * Get patient data
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} Patient data
   */
  getPatientData: (patientId) =>
    apiRequest("GET", `/healthcare/patients/${patientId}`, null, {
      errorMessage: "Failed to fetch patient data",
    }),

  /**
   * Get patient list
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Patient list data
   */
  getPatientList: (params = {}) =>
    apiRequest("GET", "/healthcare/patients", params, {
      errorMessage: "Failed to fetch patient list",
    }),

  /**
   * Get medical records
   * @param {string} patientId - Patient ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Medical records data
   */
  getMedicalRecords: (patientId, params = {}) =>
    apiRequest("GET", `/healthcare/patients/${patientId}/records`, params, {
      errorMessage: "Failed to fetch medical records",
    }),

  /**
   * Create medical record
   * @param {string} patientId - Patient ID
   * @param {Object} data - Medical record data
   * @returns {Promise<Object>} Created medical record
   */
  createMedicalRecord: (patientId, data) =>
    apiRequest("POST", `/healthcare/patients/${patientId}/records`, data, {
      errorMessage: "Failed to create medical record",
      successMessage: "Medical record created successfully",
    }),

  /**
   * Update medical record
   * @param {string} recordId - Medical record ID
   * @param {Object} data - Updated medical record data
   * @returns {Promise<Object>} Updated medical record
   */
  updateMedicalRecord: (recordId, data) =>
    apiRequest("PUT", `/healthcare/records/${recordId}`, data, {
      errorMessage: "Failed to update medical record",
      successMessage: "Medical record updated successfully",
    }),

  /**
   * Get medications
   * @param {string} patientId - Patient ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Medications data
   */
  getMedications: (patientId, params = {}) =>
    apiRequest("GET", `/healthcare/patients/${patientId}/medications`, params, {
      errorMessage: "Failed to fetch medications",
    }),

  /**
   * Get healthcare providers
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Healthcare providers data
   */
  getProviders: (params = {}) =>
    apiRequest("GET", "/healthcare/providers", params, {
      errorMessage: "Failed to fetch healthcare providers",
    }),

  /**
   * Approve healthcare request
   * @param {string} requestId - Request ID
   * @param {Object} data - Approval data
   * @returns {Promise<Object>} Approval result
   */
  approveRequest: (requestId, data = {}) =>
    apiRequest("POST", `/healthcare/approvals/${requestId}/approve`, data, {
      errorMessage: "Failed to approve request",
      successMessage: "Request approved successfully",
    }),

  /**
   * Reject healthcare request
   * @param {string} requestId - Request ID
   * @param {Object} data - Rejection data
   * @returns {Promise<Object>} Rejection result
   */
  rejectRequest: (requestId, data = {}) =>
    apiRequest("POST", `/healthcare/approvals/${requestId}/reject`, data, {
      errorMessage: "Failed to reject request",
      successMessage: "Request rejected successfully",
    }),
}
