/**
 * Helper utility functions for the application
 */

/**
 * Format a date and time for display
 * @param {string|Date} dateTime - The date and time to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  
  const date = new Date(dateTime);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Get CSS color classes based on status
 * @param {string} status - Status value (success, warning, error, etc.)
 * @returns {string} CSS classes for the status
 */
export const getStatusColorClasses = (status) => {
  switch (status?.toLowerCase()) {
    case 'success':
    case 'active':
    case 'healthy':
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'warning':
    case 'pending':
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'error':
    case 'critical':
    case 'inactive':
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'info':
    case 'normal':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Capitalize the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format a number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (num === undefined || num === null) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Truncate a string to a specified length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated string
 */
export const truncateString = (str, length = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

/**
 * Format a percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercent = (value, decimals = 0) => {
  if (value === undefined || value === null) return '';
  return value.toFixed(decimals) + '%';
};

/**
 * Group metrics by their type
 * @param {Array} metrics - Array of metric objects
 * @returns {Object} Metrics grouped by type
 */
export const groupMetricsByType = (metrics) => {
  if (!metrics || !Array.isArray(metrics)) return {};
  
  return metrics.reduce((groups, metric) => {
    const type = metric.type || 'unknown';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(metric);
    return groups;
  }, {});
};

/**
 * Format metric type for display
 * @param {string} type - Metric type identifier
 * @returns {string} Formatted metric type name
 */
export const formatMetricType = (type) => {
  if (!type) return '';
  
  // Replace underscores with spaces and capitalize each word
  const formatted = type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  
  // Handle special cases
  const specialCases = {
    'Heart Rate': 'Heart Rate (BPM)',
    'Blood Pressure': 'Blood Pressure (mmHg)',
    'Spo2': 'SpO₂ (%)',
    'Bmi': 'BMI',
    'Vo2 Max': 'VO₂ Max'
  };
  
  return specialCases[formatted] || formatted;
};

/**
 * Calculate age from birthdate
 * @param {string|Date} birthdate - Birthdate to calculate age from
 * @returns {number} Age in years
 */
export const calculateAge = (birthdate) => {
  if (!birthdate) return 0;
  
  const birth = new Date(birthdate);
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};
