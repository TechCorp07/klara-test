/**
 * Main utility exports file
 * This file exports all utility functions from the utils directory
 */

// Import all utility functions
import {
  formatDate,
  formatDateHuman,
  formatDateTime,
  startOfDay,
  endOfDay,
  addDays,
  subtractDays,
  getDateRange,
} from "./dateUtils"

import { capitalizeFirstLetter, truncateText, formatPhoneNumber, formatSSN, sanitizeHtml, slugify } from "./stringUtils"

import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateZipCode,
  validateSSN,
  validateDateOfBirth,
} from "./validationUtils"

import { formatCurrency, formatPercentage, formatNumber, formatFileSize } from "./formatUtils"

import { calculateBMI, interpretBMI, calculateIdealWeight, calculateCalorieNeeds } from "./healthcareUtils"

// Export all utility functions
export {
  // Date utils
  formatDate,
  formatDateHuman,
  formatDateTime,
  startOfDay,
  endOfDay,
  addDays,
  subtractDays,
  getDateRange,
  // String utils
  capitalizeFirstLetter,
  truncateText,
  formatPhoneNumber,
  formatSSN,
  sanitizeHtml,
  slugify,
  // Validation utils
  validateEmail,
  validatePassword,
  validatePhone,
  validateZipCode,
  validateSSN,
  validateDateOfBirth,
  // Format utils
  formatCurrency,
  formatPercentage,
  formatNumber,
  formatFileSize,
  // Healthcare utils
  calculateBMI,
  interpretBMI,
  calculateIdealWeight,
  calculateCalorieNeeds,
}

// Add any additional utility functions that might be needed
export const getStatusColorClasses = (status) => {
  switch (status.toLowerCase()) {
    case "active":
    case "approved":
    case "completed":
    case "success":
      return "bg-green-100 text-green-800"
    case "pending":
    case "in progress":
    case "waiting":
      return "bg-yellow-100 text-yellow-800"
    case "inactive":
    case "rejected":
    case "failed":
    case "error":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}
