// lib/services/securityService.js
// Service wrapper for security scanning and vulnerability management API

import { apiRequest } from '../../api/client';

/**
 * Security service that provides access to security-related API functions
 */
export const securityService = {
  /**
   * Get security vulnerabilities
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated vulnerability data
   */
  getVulnerabilities: (filters = {}) => 
    apiRequest('GET', '/security/vulnerabilities', null, {
      params: filters,
      errorMessage: 'Failed to fetch security vulnerabilities'
    }),
  
  /**
   * Get vulnerability details
   * @param {string} id - Vulnerability ID
   * @returns {Promise<Object>} Vulnerability details
   */
  getVulnerabilityDetails: (id) => 
    apiRequest('GET', `/security/vulnerabilities/${id}`, null, {
      errorMessage: 'Failed to fetch vulnerability details'
    }),
  
  /**
   * Start a security scan
   * @param {Object} scanConfig - Scan configuration
   * @returns {Promise<Object>} Scan job details
   */
  startSecurityScan: (scanConfig) => 
    apiRequest('POST', '/security/scans', scanConfig, {
      errorMessage: 'Failed to start security scan',
      successMessage: 'Security scan started successfully'
    }),
    
  /**
   * Run a security scan
   * @param {string} scanType - Type of scan to run
   * @param {Object} scanOptions - Scan options
   * @returns {Promise<Object>} Scan job details
   */
  runSecurityScan: (scanType, scanOptions = {}) => 
    apiRequest('POST', '/security/scans', { type: scanType, options: scanOptions }, {
      errorMessage: 'Failed to run security scan',
      successMessage: 'Security scan started successfully'
    }),
    
  /**
   * Get scan results
   * @param {string} scanId - Scan ID
   * @returns {Promise<Object>} Scan results
   */
  getScanResults: (scanId) => 
    apiRequest('GET', `/security/scans/${scanId}`, null, {
      errorMessage: 'Failed to fetch scan results'
    }),
  
  /**
   * Get security scan status
   * @param {string} scanId - Scan ID
   * @returns {Promise<Object>} Scan status
   */
  getSecurityScanStatus: (scanId) => 
    apiRequest('GET', `/security/scans/${scanId}`, null, {
      errorMessage: 'Failed to fetch scan status'
    }),
  
  /**
   * Get security scan history
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated scan history
   */
  getSecurityScanHistory: (filters = {}) => 
    apiRequest('GET', '/security/scans/history', null, {
      params: filters,
      errorMessage: 'Failed to fetch scan history'
    }),
  
  /**
   * Get security metrics
   * @returns {Promise<Object>} Security metrics
   */
  getSecurityMetrics: () => 
    apiRequest('GET', '/security/metrics', null, {
      errorMessage: 'Failed to fetch security metrics'
    }),
  
  /**
   * Update vulnerability status
   * @param {string} id - Vulnerability ID
   * @param {Object} updateData - Status update data
   * @returns {Promise<Object>} Updated vulnerability
   */
  updateVulnerabilityStatus: (id, updateData) => 
    apiRequest('PATCH', `/security/vulnerabilities/${id}/status`, updateData, {
      errorMessage: 'Failed to update vulnerability status',
      successMessage: 'Vulnerability status updated successfully'
    }),
  
  /**
   * Create remediation plan
   * @param {string} vulnerabilityId - Vulnerability ID
   * @param {Object} planData - Remediation plan data
   * @returns {Promise<Object>} Created remediation plan
   */
  createRemediationPlan: (vulnerabilityId, planData) => 
    apiRequest('POST', `/security/vulnerabilities/${vulnerabilityId}/remediation`, planData, {
      errorMessage: 'Failed to create remediation plan',
      successMessage: 'Remediation plan created successfully'
    }),
  
  /**
   * Get compliance report
   * @returns {Promise<Object>} Security compliance report
   */
  getComplianceReport: () => 
    apiRequest('GET', '/security/compliance', null, {
      errorMessage: 'Failed to fetch compliance report'
    }),
    
  /**
   * Get compliance status for a specific standard
   * @param {string} standard - Compliance standard (e.g., 'hipaa', 'gdpr')
   * @returns {Promise<Object>} Compliance status for the specified standard
   */
  getComplianceStatus: (standard) => 
    apiRequest('GET', `/security/compliance/${standard}`, null, {
      errorMessage: `Failed to fetch ${standard} compliance status`
    }),
};

export default securityService;
