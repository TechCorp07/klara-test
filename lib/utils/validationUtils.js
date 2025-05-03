/**
 * Utility functions for data validation
 */

/**
 * Validates if a string is a valid URL
 * @param {string} url - The URL to validate
 * @param {Object} options - Validation options
 * @param {boolean} options.requireHttps - Whether to require HTTPS protocol
 * @param {Array<string>} options.allowedDomains - List of allowed domains
 * @param {boolean} options.allowLocalhost - Whether to allow localhost URLs
 * @returns {boolean} - True if the URL is valid, false otherwise
 */
export function isValidUrl(url, options = {}) {
  const { requireHttps = false, allowedDomains = [], allowLocalhost = false } = options

  try {
    const urlObj = new URL(url)

    // Check protocol if HTTPS is required
    if (requireHttps && urlObj.protocol !== "https:") {
      return false
    }

    // Check if localhost is allowed
    if (!allowLocalhost && (urlObj.hostname === "localhost" || urlObj.hostname === "127.0.0.1")) {
      return false
    }

    // Check allowed domains if specified
    if (allowedDomains.length > 0) {
      const domain = urlObj.hostname
      return allowedDomains.some((allowedDomain) => domain === allowedDomain || domain.endsWith(`.${allowedDomain}`))
    }

    return true
  } catch (error) {
    return false
  }
}

/**
 * Validates if a string is a valid email address
 * @param {string} email - The email to validate
 * @returns {boolean} - True if the email is valid, false otherwise
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates if a string is a valid email address (alias for isValidEmail)
 * @param {string} email - The email to validate
 * @returns {boolean} - True if the email is valid, false otherwise
 */
export const validateEmail = isValidEmail

/**
 * Validates if a password meets security requirements (alias for isStrongPassword)
 * @param {string} password - The password to validate
 * @param {Object} options - Validation options
 * @returns {boolean} - True if the password meets requirements, false otherwise
 */
export const validatePassword = (password, options = {}) => {
  return isStrongPassword(password, options)
}

/**
 * Validates if a string is a valid phone number (alias for isValidPhone)
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if the phone number is valid, false otherwise
 */
export const validatePhone = isValidPhone

/**
 * Validates if a string is a valid phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if the phone number is valid, false otherwise
 */
export function isValidPhone(phone) {
  // Basic phone validation - can be enhanced for specific formats
  const phoneRegex = /^\+?[0-9]{10,15}$/
  return phoneRegex.test(phone.replace(/[\s()-]/g, ""))
}

/**
 * Validates if a string is a valid date in ISO format
 * @param {string} dateString - The date string to validate
 * @returns {boolean} - True if the date is valid, false otherwise
 */
export function isValidDate(dateString) {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

/**
 * Validates if a value is within a specified range
 * @param {number} value - The value to validate
 * @param {number} min - The minimum allowed value
 * @param {number} max - The maximum allowed value
 * @returns {boolean} - True if the value is within range, false otherwise
 */
export function isInRange(value, min, max) {
  return value >= min && value <= max
}

/**
 * Validates if a string matches a specific pattern
 * @param {string} value - The string to validate
 * @param {RegExp} pattern - The regular expression pattern
 * @returns {boolean} - True if the string matches the pattern, false otherwise
 */
export function matchesPattern(value, pattern) {
  return pattern.test(value)
}

/**
 * Validates if a password meets security requirements
 * @param {string} password - The password to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum password length
 * @param {boolean} options.requireUppercase - Whether to require uppercase letters
 * @param {boolean} options.requireLowercase - Whether to require lowercase letters
 * @param {boolean} options.requireNumbers - Whether to require numbers
 * @param {boolean} options.requireSpecialChars - Whether to require special characters
 * @returns {boolean} - True if the password meets requirements, false otherwise
 */
export function isStrongPassword(password, options = {}) {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
  } = options

  if (password.length < minLength) {
    return false
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return false
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return false
  }

  if (requireNumbers && !/[0-9]/.test(password)) {
    return false
  }

  if (requireSpecialChars && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return false
  }

  return true
}

/**
 * Sanitizes a string by removing potentially dangerous characters
 * @param {string} input - The input string to sanitize
 * @returns {string} - The sanitized string
 */
export function sanitizeString(input) {
  if (typeof input !== "string") {
    return ""
  }
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
}

/**
 * Validates if a string is a valid UUID
 * @param {string} uuid - The UUID to validate
 * @returns {boolean} - True if the UUID is valid, false otherwise
 */
export function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Validates if a string is a valid healthcare provider NPI number
 * @param {string} npi - The NPI number to validate
 * @returns {boolean} - True if the NPI is valid, false otherwise
 */
export function isValidNPI(npi) {
  // NPI is a 10-digit number
  return /^\d{10}$/.test(npi)
}

/**
 * Validates if a string is a valid US ZIP code
 * @param {string} zipCode - The ZIP code to validate
 * @param {boolean} allowExtended - Whether to allow ZIP+4 format
 * @returns {boolean} - True if the ZIP code is valid, false otherwise
 */
export function isValidZipCode(zipCode, allowExtended = true) {
  if (allowExtended) {
    return /^\d{5}(-\d{4})?$/.test(zipCode)
  }
  return /^\d{5}$/.test(zipCode)
}
