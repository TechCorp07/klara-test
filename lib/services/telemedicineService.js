// lib/services/telemedicineService.js
// Service wrapper for telemedicine API

import telemedicineApi from '../../api/telemedicine';

/**
 * Telemedicine service that provides access to telemedicine-related API functions
 */
export const telemedicine = {
  ...telemedicineApi,
  
  // Add any additional service-specific logic here
  
  /**
   * Get upcoming appointments for the current user
   * @param {Object} filters - Optional filter parameters
   * @returns {Promise<Object>} Paginated appointments
   */
  getUpcomingAppointments: (filters = {}) => 
    telemedicineApi.getList('/appointments/upcoming', filters, { 
      errorMessage: 'Failed to fetch upcoming appointments'
    }),
  
  /**
   * Get provider appointments with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated appointments
   */
  getProviderAppointments: (filters = {}) => 
    telemedicineApi.getList('/provider-appointments', filters, { 
      errorMessage: 'Failed to fetch provider appointments'
    }),
  
  /**
   * Get provider messages with optional filters
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Object>} Paginated messages
   */
  getProviderMessages: (filters = {}) => 
    telemedicineApi.getList('/provider-messages', filters, { 
      errorMessage: 'Failed to fetch provider messages'
    }),
};

export default telemedicine;
