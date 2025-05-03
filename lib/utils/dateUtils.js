/**
 * Format a date string into a human-readable format
 * @param {string|Date} date - The date to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return ""

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("en-US", defaultOptions).format(dateObj)
  } catch (error) {
    console.error("Error formatting date:", error)
    return ""
  }
}

/**
 * Calculate the difference in days between two dates
 * @param {string|Date} startDate - The start date
 * @param {string|Date} endDate - The end date
 * @returns {number} Number of days between dates
 */
export function getDaysDifference(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate || new Date())
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Check if a date is in the past
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if date is in the past
 */
export function isPastDate(date) {
  return new Date(date) < new Date()
}

/**
 * Format a date as a relative time (e.g., "2 days ago")
 * @param {string|Date} date - The date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return ""

  const now = new Date()
  const dateObj = new Date(date)
  const diffMs = now - dateObj

  // Convert to seconds
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return `${diffSec} second${diffSec !== 1 ? "s" : ""} ago`

  // Convert to minutes
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`

  // Convert to hours
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`

  // Convert to days
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`

  // Convert to months
  const diffMonth = Math.floor(diffDay / 30)
  if (diffMonth < 12) return `${diffMonth} month${diffMonth !== 1 ? "s" : ""} ago`

  // Convert to years
  const diffYear = Math.floor(diffMonth / 12)
  return `${diffYear} year${diffYear !== 1 ? "s" : ""} ago`
}
