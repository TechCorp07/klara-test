/**
 * Format utility functions for formatting various data types
 */

/**
 * Format a number as currency
 * @param {number} value - Number to format
 * @param {string} currency - Currency code (default: USD)
 * @param {string} locale - Locale (default: en-US)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = "USD", locale = "en-US") => {
  if (value === null || value === undefined) return ""
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value)
}

/**
 * Format a number with commas
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @param {string} locale - Locale (default: en-US)
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, decimals = 0, locale = "en-US") => {
  if (value === null || value === undefined) return ""
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format a number as a percentage
 * @param {number} value - Number to format (0-1)
 * @param {number} decimals - Number of decimal places
 * @param {string} locale - Locale (default: en-US)
 * @returns {string} Formatted percentage string
 */
export const formatPercent = (value, decimals = 0, locale = "en-US") => {
  if (value === null || value === undefined) return ""
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format a number as a percentage (alias for formatPercent)
 * @param {number} value - Number to format (0-1)
 * @param {number} decimals - Number of decimal places
 * @param {string} locale - Locale (default: en-US)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = formatPercent

/**
 * Format a file size in bytes to a human-readable format
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size string
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes"
  if (!bytes) return ""

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
}

/**
 * Format a duration in seconds to a human-readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return ""

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)

  return parts.join(" ")
}

/**
 * Format a name (first and last)
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @param {boolean} lastNameFirst - Whether to put last name first
 * @returns {string} Formatted name
 */
export const formatName = (firstName, lastName, lastNameFirst = false) => {
  if (!firstName && !lastName) return ""
  if (!firstName) return lastName
  if (!lastName) return firstName

  return lastNameFirst ? `${lastName}, ${firstName}` : `${firstName} ${lastName}`
}

/**
 * Format an address
 * @param {Object} address - Address object
 * @param {boolean} singleLine - Whether to format as a single line
 * @returns {string} Formatted address
 */
export const formatAddress = (address, singleLine = false) => {
  if (!address) return ""

  const { street1, street2, city, state, zipCode, country } = address

  const parts = []
  if (street1) parts.push(street1)
  if (street2) parts.push(street2)

  const cityStateZip = [city, state, zipCode].filter(Boolean).join(", ")
  if (cityStateZip) parts.push(cityStateZip)
  if (country) parts.push(country)

  return singleLine ? parts.join(", ") : parts.join("\n")
}
