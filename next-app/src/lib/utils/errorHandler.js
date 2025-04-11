// lib/utils/errorHandler.js
import { toast } from 'react-toastify';

/**
 * General error handler for API calls
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default error message
 * @param {boolean} showToast - Whether to show error toast
 * @returns {Object} Standardized error object
 */
export const handleApiError = (error, defaultMessage = 'An error occurred', showToast = true) => {
  // Default error structure
  const errorObject = {
    message: defaultMessage,
    status: 500,
    details: null,
    original: error
  };
  
  try {
    // Handle Axios errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      errorObject.status = status;
      
      // Handle structured API error responses
      if (data) {
        if (data.message || data.detail) {
          errorObject.message = data.message || data.detail || defaultMessage;
        }
        
        if (data.details || data.errors) {
          errorObject.details = data.details || data.errors;
        }
      }
      
      // Handle specific status codes
      if (status === 401) {
        errorObject.message = 'Authentication required. Please log in.';
      } else if (status === 403) {
        errorObject.message = 'You do not have permission to perform this action.';
      } else if (status === 404) {
        errorObject.message = 'The requested resource was not found.';
      } else if (status === 422) {
        errorObject.message = 'Validation error. Please check your input.';
        
        // Format validation errors for display
        if (data.details && typeof data.details === 'object') {
          const formattedErrors = Object.entries(data.details)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ');
          
          errorObject.message = `${errorObject.message} ${formattedErrors}`;
        }
      } else if (status >= 500) {
        errorObject.message = 'Server error. Please try again later.';
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorObject.message = 'No response from server. Please check your connection.';
      errorObject.status = 0;
    } else {
      // Something happened in setting up the request that triggered an Error
      errorObject.message = error.message || defaultMessage;
    }
    
    // Show toast notification if requested
    if (showToast) {
      toast.error(errorObject.message);
    }
    
    // Log error to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('[API Error]:', error);
    }
    
    return errorObject;
  } catch (handlingError) {
    // In case error handling itself fails, return a safe error
    console.error('Error while handling API error:', handlingError);
    
    if (showToast) {
      toast.error(defaultMessage);
    }
    
    return {
      message: defaultMessage,
      status: 500,
      details: null,
      original: error
    };
  }
};

/**
 * Format validation errors into a readable form
 * @param {Object} errors - Validation errors object
 * @returns {string} Formatted error string
 */
export const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') {
    return '';
  }
  
  return Object.entries(errors)
    .map(([field, messages]) => {
      const fieldName = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      const formattedMessages = Array.isArray(messages) ? messages.join(', ') : messages;
      return `${fieldName}: ${formattedMessages}`;
    })
    .join('; ');
};

/**
 * Create a safe error logger that won't throw
 * @param {Function} logFunction - Function to call for logging
 * @returns {Function} Safe logging function
 */
export const createSafeErrorLogger = (logFunction) => {
  return (...args) => {
    try {
      logFunction(...args);
    } catch (error) {
      // Safely fail logging without throwing
      console.error('Error in error logger:', error);
    }
  };
};

export default handleApiError;