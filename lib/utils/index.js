import { formatDate, getDaysDifference, isPastDate, formatRelativeTime } from "./dateUtils"
import { formatCurrency, formatNumber, formatPercentage } from "./formatUtils"
import { validateEmail, validatePassword, validatePhone } from "./validationUtils"
import { formatPatientName, formatMedicalCode } from "./healthcareUtils"
import { capitalize, truncate, slugify } from "./stringUtils"

// Export all utility functions
export {
  // Date utilities
  formatDate,
  getDaysDifference,
  isPastDate,
  formatRelativeTime,
  // Format utilities
  formatCurrency,
  formatNumber,
  formatPercentage,
  // Validation utilities
  validateEmail,
  validatePassword,
  validatePhone,
  // Healthcare utilities
  formatPatientName,
  formatMedicalCode,
  // String utilities
  capitalize,
  truncate,
  slugify,
}

// Default export for backward compatibility
export default {
  formatDate,
  getDaysDifference,
  isPastDate,
  formatRelativeTime,
  formatCurrency,
  formatNumber,
  formatPercentage,
  validateEmail,
  validatePassword,
  validatePhone,
  formatPatientName,
  formatMedicalCode,
  capitalize,
  truncate,
  slugify,
}
