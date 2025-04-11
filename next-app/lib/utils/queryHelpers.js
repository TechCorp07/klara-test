/**
 * Create query parameters for API calls
 * @param {Object} options - Query options
 * @returns {string} Query string
 */
export function createQueryParams(options = {}) {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    return params.toString();
  }
  
  /**
   * Combine multiple parameter objects for API calls
   * @param  {...Object} paramObjects - Parameter objects
   * @returns {Object} Combined parameters
   */
  export function combineParams(...paramObjects) {
    return paramObjects.reduce((acc, params) => {
      return { ...acc, ...params };
    }, {});
  }