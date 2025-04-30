/**
 * Validation utility functions for form and data validation
 */

/**
 * Check if a value is empty (null, undefined, empty string, or empty array)
 * @param {*} value - Value to check
 * @returns {boolean} True if empty, false otherwise
 */
export const isEmpty = (value) => {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" && Object.keys(value).length === 0)
  )
}

/**
 * Validate an email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidEmail = (email) => {
  if (!email) return false
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

/**
 * Validate a password (at least 8 chars, 1 uppercase, 1 lowercase, 1 number)
 * @param {string} password - Password to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidPassword = (password) => {
  if (!password) return false
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return re.test(password)
}

/**
 * Validate a phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidPhone = (phone) => {
  if (!phone) return false
  const re = /^$?([0-9]{3})$?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
  return re.test(phone)
}

/**
 * Validate a URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidUrl = (url) => {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Validate a date string (YYYY-MM-DD)
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidDate = (dateStr) => {
  if (!dateStr) return false
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateStr)) return false

  const date = new Date(dateStr)
  const timestamp = date.getTime()
  if (isNaN(timestamp)) return false

  return date.toISOString().slice(0, 10) === dateStr
}

/**
 * Validate a US zip code
 * @param {string} zip - Zip code to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidZipCode = (zip) => {
  if (!zip) return false
  const re = /^\d{5}(-\d{4})?$/
  return re.test(zip)
}

/**
 * Validate a credit card number using Luhn algorithm
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidCreditCard = (cardNumber) => {
  if (!cardNumber) return false

  // Remove spaces and dashes
  const value = cardNumber.replace(/\s+|-/g, "")

  // Check if contains only digits and has valid length
  if (!/^\d+$/.test(value) || value.length < 13 || value.length > 19) {
    return false
  }

  // Luhn algorithm
  let sum = 0
  let shouldDouble = false

  for (let i = value.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(value.charAt(i))

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}

/**
 * Get validation errors for a form object
 * @param {Object} data - Form data
 * @param {Object} rules - Validation rules
 * @returns {Object} Object with validation errors
 */
export const validateForm = (data, rules) => {
  const errors = {}

  Object.keys(rules).forEach((field) => {
    const value = data[field]
    const fieldRules = rules[field]

    if (fieldRules.required && isEmpty(value)) {
      errors[field] = "This field is required"
    } else if (value) {
      if (fieldRules.email && !isValidEmail(value)) {
        errors[field] = "Please enter a valid email address"
      }
      if (fieldRules.password && !isValidPassword(value)) {
        errors[field] = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number"
      }
      if (fieldRules.phone && !isValidPhone(value)) {
        errors[field] = "Please enter a valid phone number"
      }
      if (fieldRules.url && !isValidUrl(value)) {
        errors[field] = "Please enter a valid URL"
      }
      if (fieldRules.date && !isValidDate(value)) {
        errors[field] = "Please enter a valid date (YYYY-MM-DD)"
      }
      if (fieldRules.zipCode && !isValidZipCode(value)) {
        errors[field] = "Please enter a valid zip code"
      }
      if (fieldRules.creditCard && !isValidCreditCard(value)) {
        errors[field] = "Please enter a valid credit card number"
      }
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] = `Must be at least ${fieldRules.minLength} characters`
      }
      if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors[field] = `Must be no more than ${fieldRules.maxLength} characters`
      }
      if (fieldRules.match && value !== data[fieldRules.match]) {
        errors[field] = `Must match ${fieldRules.match}`
      }
      if (fieldRules.custom && typeof fieldRules.custom === "function") {
        const customError = fieldRules.custom(value, data)
        if (customError) {
          errors[field] = customError
        }
      }
    }
  })

  return errors
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean|string} True if valid, error message if invalid
 */
export const validateEmail = (email) => {
  if (!email) return "Email is required"
  if (!isValidEmail(email)) return "Please enter a valid email address"
  return true
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean|string} True if valid, error message if invalid
 */
export const validatePassword = (password) => {
  if (!password) return "Password is required"
  if (password.length < 8) return "Password must be at least 8 characters"
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter"
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter"
  if (!/[0-9]/.test(password)) return "Password must contain at least one number"
  return true
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean|string} True if valid, error message if invalid
 */
export const validatePhone = (phone) => {
  if (!phone) return "Phone number is required"
  if (!isValidPhone(phone)) return "Please enter a valid phone number"
  return true
}

/**
 * Validate US zip code format
 * @param {string} zipCode - Zip code to validate
 * @returns {boolean|string} True if valid, error message if invalid
 */
export const validateZipCode = (zipCode) => {
  if (!zipCode) return "Zip code is required"
  if (!isValidZipCode(zipCode)) return "Please enter a valid zip code (e.g., 12345 or 12345-6789)"
  return true
}

/**
 * Validate SSN format
 * @param {string} ssn - Social Security Number to validate
 * @returns {boolean|string} True if valid, error message if invalid
 */
export const validateSSN = (ssn) => {
  if (!ssn) return "SSN is required"

  // Remove any non-numeric characters
  const cleaned = ssn.replace(/\D/g, "")

  if (cleaned.length !== 9) return "Please enter a valid 9-digit SSN"

  // Check for obviously invalid SSNs
  if (
    cleaned === "000000000" ||
    cleaned === "111111111" ||
    cleaned === "222222222" ||
    cleaned === "333333333" ||
    cleaned === "444444444" ||
    cleaned === "555555555" ||
    cleaned === "666666666" ||
    cleaned === "777777777" ||
    cleaned === "888888888" ||
    cleaned === "999999999"
  ) {
    return "Please enter a valid SSN"
  }

  // Check if first three digits are 000, 666, or 900-999
  const firstThree = Number.parseInt(cleaned.substring(0, 3), 10)
  if (firstThree === 0 || firstThree === 666 || firstThree >= 900) {
    return "Please enter a valid SSN"
  }

  // Check if middle two digits are 00
  if (cleaned.substring(3, 5) === "00") {
    return "Please enter a valid SSN"
  }

  // Check if last four digits are 0000
  if (cleaned.substring(5, 9) === "0000") {
    return "Please enter a valid SSN"
  }

  return true
}

/**
 * Validate date of birth
 * @param {string} dob - Date of birth (YYYY-MM-DD)
 * @returns {boolean|string} True if valid, error message if invalid
 */
export const validateDateOfBirth = (dob) => {
  if (!dob) return "Date of birth is required"

  // Check format
  if (!isValidDate(dob)) return "Please enter a valid date in YYYY-MM-DD format"

  const birthDate = new Date(dob)
  const today = new Date()

  // Check if date is in the future
  if (birthDate > today) return "Date of birth cannot be in the future"

  // Check if person is too old (e.g., over 120 years)
  const maxAge = new Date()
  maxAge.setFullYear(today.getFullYear() - 120)
  if (birthDate < maxAge) return "Please enter a valid date of birth"

  return true
}
