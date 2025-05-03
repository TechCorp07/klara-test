/**
 * Session utility functions
 */

/**
 * Get the session start time from sessionStorage
 * @returns {number} - Session start time in milliseconds
 */
export const getSessionStartTime = () => {
  if (typeof window === "undefined") return null

  const startTime = sessionStorage.getItem("sessionStartTime")
  return startTime ? Number.parseInt(startTime, 10) : null
}

/**
 * Set the session start time in sessionStorage
 */
export const setSessionStartTime = () => {
  if (typeof window === "undefined") return

  if (!sessionStorage.getItem("sessionStartTime")) {
    sessionStorage.setItem("sessionStartTime", Date.now().toString())
  }
}

/**
 * Reset the session start time
 */
export const resetSessionStartTime = () => {
  if (typeof window === "undefined") return

  sessionStorage.setItem("sessionStartTime", Date.now().toString())
}

/**
 * Clear the session
 */
export const clearSession = () => {
  if (typeof window === "undefined") return

  sessionStorage.removeItem("sessionStartTime")
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")

  // Clear cookies
  document.cookie = "access_token=; path=/; max-age=0; SameSite=Strict; Secure"
  document.cookie = "user_role=; path=/; max-age=0; SameSite=Strict; Secure"
}

/**
 * Check if the session has timed out
 * @param {number} timeoutMinutes - Session timeout in minutes
 * @returns {boolean} - True if the session has timed out
 */
export const hasSessionTimedOut = (timeoutMinutes = 30) => {
  if (typeof window === "undefined") return false

  const startTime = getSessionStartTime()
  if (!startTime) return false

  const currentTime = Date.now()
  const timeoutMs = timeoutMinutes * 60 * 1000

  return currentTime - startTime > timeoutMs
}

/**
 * Set a cookie
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} maxAgeSeconds - Cookie max age in seconds
 */
export const setCookie = (name, value, maxAgeSeconds = 86400) => {
  if (typeof window === "undefined") return

  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; SameSite=Strict; Secure`
}

/**
 * Get a cookie value
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
export const getCookie = (name) => {
  if (typeof window === "undefined") return null

  const cookies = document.cookie.split(";")
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim()
    if (cookie.startsWith(`${name}=`)) {
      return cookie.substring(name.length + 1)
    }
  }
  return null
}
