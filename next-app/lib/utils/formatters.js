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
  