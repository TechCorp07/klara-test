/**
 * Consolidated utility functions for common operations
 */

// ----- Date Formatting Utilities -----

/**
 * Format a date string to a localized date string
 * @param {string|Date} dateString - Date string or Date object
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, options = {}) {
    if (!dateString) return '';
    
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    
    // Default options
    const defaultOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return date.toLocaleDateString(undefined, { ...defaultOptions, ...options });
  }
  
  /**
   * Format a date string to a localized date and time string
   * @param {string|Date} dateString - Date string or Date object
   * @param {Object} options - Intl.DateTimeFormat options
   * @returns {string} Formatted date and time string
   */
  export function formatDateTime(dateString, options = {}) {
    if (!dateString) return '';
    
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    
    // Default options
    const defaultOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleString(undefined, { ...defaultOptions, ...options });
  }
  
  /**
   * Format a time string to a localized time string
   * @param {string|Date} dateString - Date string or Date object
   * @param {Object} options - Intl.DateTimeFormat options
   * @returns {string} Formatted time string
   */
  export function formatTime(dateString, options = {}) {
    if (!dateString) return '';
    
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    
    // Default options
    const defaultOptions = { 
      hour: '2-digit', 
      minute: '2-digit'
    };
    
    return date.toLocaleTimeString(undefined, { ...defaultOptions, ...options });
  }
  
  /**
   * Format a relative time (e.g., "2 hours ago")
   * @param {string|Date} dateString - Date string or Date object
   * @returns {string} Relative time string
   */
  export function formatTimeAgo(dateString) {
    if (!dateString) return '';
    
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) {
      return 'just now';
    }
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    
    return formatDate(date);
  }
  
  /**
   * Calculate age from date of birth
   * @param {string|Date} dateOfBirth - Date of birth
   * @returns {number} Age in years
   */
  export function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 0;
    
    const birthDate = dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  
  // ----- Number Formatting Utilities -----
  
  /**
   * Format a number as currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code (default: USD)
   * @returns {string} Formatted currency string
   */
  export function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency
    }).format(amount);
  }
  
  /**
   * Format a number with proper comma separators and decimal places
   * @param {number} value - Number to format
   * @param {number} decimalPlaces - Number of decimal places to show
   * @returns {string} Formatted number
   */
  export function formatNumber(value, decimalPlaces = 0) {
    if (value === null || value === undefined) return '';
    
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    }).format(value);
  }
  
  /**
   * Format a percentage value
   * @param {number} value - Number to format as percentage (0-1)
   * @param {number} decimalPlaces - Number of decimal places to show
   * @returns {string} Formatted percentage
   */
  export function formatPercent(value, decimalPlaces = 0) {
    if (value === null || value === undefined) return '';
    
    return new Intl.NumberFormat(undefined, {
      style: 'percent',
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    }).format(value);
  }
  
  // ----- String Formatting Utilities -----
  
  /**
   * Format a string to capitalize the first letter of each word
   * @param {string} text - Text to format
   * @returns {string} Formatted text
   */
  export function toTitleCase(text) {
    if (!text) return '';
    
    return text
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  /**
   * Truncate a string with ellipsis if it exceeds the specified length
   * @param {string} text - Text to truncate
   * @param {number} length - Maximum length
   * @returns {string} Truncated text
   */
  export function truncate(text, length = 100) {
    if (!text) return '';
    if (text.length <= length) return text;
    
    return text.substring(0, length) + '...';
  }
  
  /**
   * Convert snake_case to camelCase
   * @param {string} text - Text in snake_case
   * @returns {string} Text in camelCase
   */
  export function snakeToCamel(text) {
    if (!text) return '';
    
    return text.replace(
      /([-_][a-z])/g,
      (group) => group.toUpperCase().replace('-', '').replace('_', '')
    );
  }
  
  /**
   * Convert camelCase to snake_case
   * @param {string} text - Text in camelCase
   * @returns {string} Text in snake_case
   */
  export function camelToSnake(text) {
    if (!text) return '';
    
    return text.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`
    );
  }
  
  // ----- Validation Utilities -----
  
  /**
   * Validate an email address
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid, false otherwise
   */
  export function isValidEmail(email) {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  }
  
  /**
   * Validate a password
   * @param {string} password - Password to validate
   * @returns {Object} Validation result with details
   */
  export function validatePassword(password) {
    const result = {
      isValid: false,
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    };
    
    result.isValid = result.hasMinLength && 
                    result.hasUppercase && 
                    result.hasLowercase && 
                    result.hasNumber && 
                    result.hasSpecialChar;
    
    return result;
  }
  
  /**
   * Validate a phone number
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid, false otherwise
   */
  export function isValidPhone(phone) {
    // This is a simple validation for demonstration
    // In a real app, you might want a more sophisticated validation
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
  }
  
  // ----- Performance Utilities -----
  
  /**
   * Debounce a function to limit how often it can be called
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @param {boolean} immediate - Whether to invoke immediately
   * @returns {Function} Debounced function
   */
  export function debounce(func, wait = 300, immediate = false) {
    let timeout;
    
    return function executedFunction(...args) {
      const context = this;
      
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      
      const callNow = immediate && !timeout;
      
      clearTimeout(timeout);
      
      timeout = setTimeout(later, wait);
      
      if (callNow) func.apply(context, args);
    };
  }
  
  /**
   * Throttle a function to limit its execution rate
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  export function throttle(func, limit = 300) {
    let lastCall;
    let lastRan;
    
    return function executedFunction(...args) {
      const context = this;
      const now = Date.now();
      
      if (!lastRan) {
        func.apply(context, args);
        lastRan = now;
        return;
      }
      
      clearTimeout(lastCall);
      
      lastCall = setTimeout(function() {
        if ((now - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = now;
        }
      }, limit - (now - lastRan));
    };
  }
  
  // ----- Environment Utilities -----
  
  /**
   * Check if code is running on the client side
   * @returns {boolean} Whether code is running on client
   */
  export function isClient() {
    return typeof window !== 'undefined';
  }
  
  /**
   * Check if code is running on the server side
   * @returns {boolean} Whether code is running on server
   */
  export function isServer() {
    return typeof window === 'undefined';
  }
  
  // ----- Object & Array Utilities -----
  
  /**
   * Deep clone an object
   * @param {Object} obj - Object to clone
   * @returns {Object} Cloned object
   */
  export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  
  /**
   * Group array elements by a key or function
   * @param {Array} array - Array to group
   * @param {string|Function} key - Grouping key or function
   * @returns {Object} Grouped object
   */
  export function groupBy(array, key) {
    return array.reduce((result, item) => {
      const groupKey = typeof key === 'function' ? key(item) : item[key];
      // Ensure the group exists
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      // Add item to the group
      result[groupKey].push(item);
      return result;
    }, {});
  }
  
  /**
   * Sort an array of objects by a key
   * @param {Array} array - Array to sort
   * @param {string} key - Sort key
   * @param {string} direction - Sort direction ('asc' or 'desc')
   * @returns {Array} Sorted array
   */
  export function sortBy(array, key, direction = 'asc') {
    const sortedArray = [...array];
    
    return sortedArray.sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  
  // ----- Query Utilities -----
  
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
  
  // ----- Role & Permission Utilities -----
  
  /**
   * Check if user has a specific role
   * @param {Object} user - User object
   * @param {string|Array} roles - Role or array of roles to check
   * @returns {boolean} True if user has role, false otherwise
   */
  export function hasRole(user, roles) {
    if (!user || !user.role) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return user.role === roles;
  }
  
  /**
   * Check if user can access a specific page or feature
   * @param {Object} user - User object
   * @param {Object} permissions - Permission configuration
   * @returns {boolean} True if user has permission, false otherwise
   */
  export function hasPermission(user, permission) {
    if (!user || !permission) return false;
    
    // System admins have access to everything
    if (user.role === 'superadmin') return true;
    
    // Check role-based permissions
    if (permission.roles && hasRole(user, permission.roles)) {
      return true;
    }
    
    // Check specific permissions
    if (permission.permissions && user.permissions) {
      return permission.permissions.some(p => user.permissions.includes(p));
    }
    
    return false;
  }