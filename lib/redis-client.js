/**
 * Redis client for caching and session management
 */
import { kv } from "@vercel/kv"

/**
 * Set a value in Redis with optional expiration
 * @param {string} key - The key to set
 * @param {any} value - The value to store
 * @param {Object} options - Options including expiration
 * @returns {Promise<string>} - Redis response
 */
export const setValue = async (key, value, options = {}) => {
  try {
    return await kv.set(key, JSON.stringify(value), options)
  } catch (error) {
    console.error("Redis set error:", error)
    throw error
  }
}

/**
 * Get a value from Redis
 * @param {string} key - The key to retrieve
 * @returns {Promise<any>} - The stored value or null
 */
export const getValue = async (key) => {
  try {
    const value = await kv.get(key)
    return value ? JSON.parse(value) : null
  } catch (error) {
    console.error("Redis get error:", error)
    return null
  }
}

/**
 * Delete a key from Redis
 * @param {string} key - The key to delete
 * @returns {Promise<number>} - Number of keys deleted
 */
export const deleteValue = async (key) => {
  try {
    return await kv.del(key)
  } catch (error) {
    console.error("Redis delete error:", error)
    throw error
  }
}

/**
 * Set a value with expiration in seconds
 * @param {string} key - The key to set
 * @param {any} value - The value to store
 * @param {number} expirySeconds - Expiration time in seconds
 * @returns {Promise<string>} - Redis response
 */
export const setWithExpiry = async (key, value, expirySeconds) => {
  return setValue(key, value, { ex: expirySeconds })
}

/**
 * Check if a key exists in Redis
 * @param {string} key - The key to check
 * @returns {Promise<boolean>} - True if key exists
 */
export const exists = async (key) => {
  try {
    return (await kv.exists(key)) === 1
  } catch (error) {
    console.error("Redis exists error:", error)
    return false
  }
}

/**
 * Increment a counter in Redis
 * @param {string} key - The key to increment
 * @param {number} by - Amount to increment by
 * @returns {Promise<number>} - New value
 */
export const increment = async (key, by = 1) => {
  try {
    return await kv.incrby(key, by)
  } catch (error) {
    console.error("Redis increment error:", error)
    throw error
  }
}

/**
 * Store user session data
 * @param {string} sessionId - Session ID
 * @param {Object} userData - User data to store
 * @param {number} expirySeconds - Session expiration in seconds
 * @returns {Promise<string>} - Redis response
 */
export const storeSession = async (sessionId, userData, expirySeconds = 3600) => {
  return setWithExpiry(`session:${sessionId}`, userData, expirySeconds)
}

/**
 * Get user session data
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} - User session data
 */
export const getSession = async (sessionId) => {
  return getValue(`session:${sessionId}`)
}

/**
 * Delete user session
 * @param {string} sessionId - Session ID
 * @returns {Promise<number>} - Number of keys deleted
 */
export const deleteSession = async (sessionId) => {
  return deleteValue(`session:${sessionId}`)
}

/**
 * Cache API response
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Response data
 * @param {number} expirySeconds - Cache expiration in seconds
 * @returns {Promise<string>} - Redis response
 */
export const cacheApiResponse = async (endpoint, data, expirySeconds = 300) => {
  const cacheKey = `api:${endpoint}`
  return setWithExpiry(cacheKey, data, expirySeconds)
}

/**
 * Get cached API response
 * @param {string} endpoint - API endpoint
 * @returns {Promise<Object>} - Cached response data
 */
export const getCachedApiResponse = async (endpoint) => {
  const cacheKey = `api:${endpoint}`
  return getValue(cacheKey)
}

/**
 * Clear cached API response
 * @param {string} endpoint - API endpoint
 * @returns {Promise<number>} - Number of keys deleted
 */
export const clearCachedApiResponse = async (endpoint) => {
  const cacheKey = `api:${endpoint}`
  return deleteValue(cacheKey)
}

export default {
  set: setValue,
  get: getValue,
  delete: deleteValue,
  setWithExpiry,
  exists,
  increment,
  storeSession,
  getSession,
  deleteSession,
  cacheApiResponse,
  getCachedApiResponse,
  clearCachedApiResponse,
}
