/**
 * Handle API errors consistently
 * @param {Error} error - Error object
 * @param {Function} toastFn - Toast function
 * @param {string} defaultMessage - Default error message
 * @returns {string} Formatted error message
 */
export function handleApiError(error, toastFn = null, defaultMessage = 'An error occurred. Please try again.') {
    console.error('API Error:', error);
    
    let errorMessage = defaultMessage;
    
    // Extract error message from response if available
    if (error.response && error.response.data) {
      const responseData = error.response.data;
      
      if (typeof responseData === 'string') {
        errorMessage = responseData;
      } else if (responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData.error) {
        errorMessage = responseData.error;
      } else if (typeof responseData === 'object') {
        // Extract first error from validation errors
        const firstErrorKey = Object.keys(responseData)[0];
        if (firstErrorKey && responseData[firstErrorKey]) {
          const firstError = responseData[firstErrorKey];
          errorMessage = Array.isArray(firstError) 
            ? `${firstErrorKey}: ${firstError[0]}`
            : `${firstErrorKey}: ${firstError}`;
        }
      }
    }
    
    // Show toast if toast function is provided
    if (toastFn) {
      toastFn(errorMessage);
    }
    
    return errorMessage;
  }
  