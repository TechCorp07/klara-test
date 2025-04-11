// lib/api/index.js
import apiClient from './client';
import authApi from './auth';
import healthcareApi from './healthcare';
import telemedicineApi from './telemedicine';
import auditApi from './audit';

// Export all API modules
export {
  apiClient,
  authApi,
  healthcareApi,
  telemedicineApi,
  auditApi
};

// Export a default object with all API modules
export default {
  client: apiClient,
  auth: authApi,
  healthcare: healthcareApi,
  telemedicine: telemedicineApi,
  audit: auditApi
};