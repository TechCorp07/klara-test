"use client";

import { apiRequest } from '@/api/client';

/**
 * Healthcare service for medical data and operations
 * NOTE: This service has been updated based on API documentation. 
 * Several endpoints were mapped to the /users or /healthcare/medical-records APIs.
 * Patient/Provider fetching now uses the /users endpoint, potentially requiring role filters.
 * Approval/Rejection logic mapped to /users/users/approve, rejection needs verification.
 */
export const healthcare = {
  /**
   * Get pending user approvals (Mapped from /healthcare/pending-approvals)
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Pending approvals data
   */
  getPendingApprovals: (params = {}) => 
    apiRequest('GET', '/users/pending-approvals', params, {
      errorMessage: 'Failed to fetch pending approvals'
    }),
  
  /**
   * Get user data (Mapped from /healthcare/patients/*)
   * @param {string} userId - User ID (assuming patientId maps to userId)
   * @returns {Promise<Object>} User data
   */
  getUserData: (userId) => 
    apiRequest('GET', `/users/users/${userId}`, null, {
      errorMessage: 'Failed to fetch user data'
    }),
  
  /**
   * Get user list (Mapped from /healthcare/patients)
   * @param {Object} params - Query parameters (e.g., role='patient')
   * @returns {Promise<Object>} User list data
   */
  getUserList: (params = {}) => 
    apiRequest('GET', '/users/users', params, {
      errorMessage: 'Failed to fetch user list'
    }),
  
  /**
   * Get medical records for a patient (Mapped from /healthcare/patients/records)
   * @param {Object} params - Query parameters (e.g., patient_id=patientId)
   * @returns {Promise<Object>} Medical records data
   */
  getMedicalRecords: (params = {}) => 
    apiRequest('GET', `/healthcare/medical-records`, params, {
      errorMessage: 'Failed to fetch medical records'
    }),

  /**
   * Get a specific medical record (New function based on backend docs)
   * @param {string} recordId - Medical record ID
   * @returns {Promise<Object>} Medical record data
   */
  getMedicalRecordById: (recordId) => 
    apiRequest('GET', `/healthcare/medical-records/${recordId}`, null, {
      errorMessage: 'Failed to fetch medical record'
    }),
  
  /**
   * Create medical record (Mapped from /healthcare/patients/records)
   * @param {Object} data - Medical record data (should include patient_id)
   * @returns {Promise<Object>} Created medical record
   */
  createMedicalRecord: (data) => 
    apiRequest('POST', `/healthcare/medical-records`, data, {
      errorMessage: 'Failed to create medical record',
      successMessage: 'Medical record created successfully'
    }),
  
  /**
   * Update medical record (Mapped from /healthcare/records/*)
   * @param {string} recordId - Medical record ID
   * @param {Object} data - Updated medical record data
   * @returns {Promise<Object>} Updated medical record
   */
  updateMedicalRecord: (recordId, data) => 
    apiRequest('PUT', `/healthcare/medical-records/${recordId}`, data, {
      errorMessage: 'Failed to update medical record',
      successMessage: 'Medical record updated successfully'
    }),
  
  /**
   * Get medications for a patient (Mapped from /healthcare/patients/medications)
   * @param {Object} params - Query parameters (e.g., patient_id=patientId)
   * @returns {Promise<Object>} Medications data
   */
  getMedications: (params = {}) => 
    apiRequest('GET', `/medication/medications`, params, {
      errorMessage: 'Failed to fetch medications'
    }),
  
  /**
   * Get healthcare providers (Mapped from /healthcare/providers)
   * @param {Object} params - Query parameters (e.g., role='provider')
   * @returns {Promise<Object>} Healthcare providers data
   */
  getProviders: (params = {}) => 
    apiRequest('GET', '/users/users', params, {
      errorMessage: 'Failed to fetch healthcare providers'
    }),
  
  /**
   * Approve user request (Mapped from /healthcare/approvals/approve)
   * @param {string} userId - User ID (assuming requestId maps to userId)
   * @param {Object} data - Approval data
   * @returns {Promise<Object>} Approval result
   */
  approveUser: (userId, data = {}) => 
    apiRequest('POST', `/users/users/${userId}/approve`, data, {
      errorMessage: 'Failed to approve user request',
      successMessage: 'User request approved successfully'
    }),
  
  /**
   * Reject healthcare request (Mapped from /healthcare/approvals/reject)
   * NOTE: No direct backend endpoint found in documentation for rejection.
   * This function may need to be removed or updated based on backend implementation.
   * @param {string} requestId - Request ID
   * @param {Object} data - Rejection data
   * @returns {Promise<Object>} Rejection result
   */
  // rejectRequest: (requestId, data = {}) => 
  //   apiRequest('POST', `/healthcare/approvals/${requestId}/reject`, data, {
  //     errorMessage: 'Failed to reject request',
  //     successMessage: 'Request rejected successfully'
  //   })
};

