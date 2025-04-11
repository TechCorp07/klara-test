// lib/utils/memoize.js

/**
 * Simple memoization function for caching expensive function results
 * @param {Function} fn - Function to memoize
 * @param {Function} keyFn - Optional function to generate cache key (defaults to JSON.stringify)
 * @returns {Function} Memoized function
 */
export const memoize = (fn, keyFn = JSON.stringify) => {
    const cache = new Map();
    
    return (...args) => {
      const key = keyFn(...args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = fn(...args);
      cache.set(key, result);
      
      return result;
    };
  };
  
  /**
   * Memoization function with TTL (time to live) cache expiration
   * @param {Function} fn - Function to memoize
   * @param {number} ttl - Time to live in milliseconds
   * @param {Function} keyFn - Optional function to generate cache key
   * @returns {Function} Memoized function
   */
  export const memoizeWithTTL = (fn, ttl = 60000, keyFn = JSON.stringify) => {
    const cache = new Map();
    const timestamps = new Map();
    
    return (...args) => {
      const key = keyFn(...args);
      const now = Date.now();
      
      // Check if value exists and hasn't expired
      if (cache.has(key) && now - timestamps.get(key) < ttl) {
        return cache.get(key);
      }
      
      // Calculate new value
      const result = fn(...args);
      
      // Store value and timestamp
      cache.set(key, result);
      timestamps.set(key, now);
      
      return result;
    };
  };
  
  /**
   * Memoize a function that returns a promise
   * @param {Function} asyncFn - Async function to memoize
   * @param {Function} keyFn - Optional function to generate cache key
   * @returns {Function} Memoized async function
   */
  export const memoizeAsync = (asyncFn, keyFn = JSON.stringify) => {
    const cache = new Map();
    
    return async (...args) => {
      const key = keyFn(...args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      try {
        const result = await asyncFn(...args);
        cache.set(key, result);
        return result;
      } catch (error) {
        // Don't cache errors
        throw error;
      }
    };
  };
  
  /**
   * Memoize a function that returns a promise, with cache expiration
   * @param {Function} asyncFn - Async function to memoize
   * @param {number} ttl - Time to live in milliseconds
   * @param {Function} keyFn - Optional function to generate cache key
   * @returns {Function} Memoized async function with TTL
   */
  export const memoizeAsyncWithTTL = (asyncFn, ttl = 60000, keyFn = JSON.stringify) => {
    const cache = new Map();
    const timestamps = new Map();
    
    return async (...args) => {
      const key = keyFn(...args);
      const now = Date.now();
      
      // Check if value exists and hasn't expired
      if (cache.has(key) && now - timestamps.get(key) < ttl) {
        return cache.get(key);
      }
      
      try {
        const result = await asyncFn(...args);
        
        // Store value and timestamp
        cache.set(key, result);
        timestamps.set(key, now);
        
        return result;
      } catch (error) {
        // Don't cache errors
        throw error;
      }
    };
  };
  
  /**
   * Clear memoization cache for a memoized function
   * @param {Function} memoizedFn - Memoized function
   */
  export const clearMemoizeCache = (memoizedFn) => {
    if (memoizedFn && memoizedFn.cache instanceof Map) {
      memoizedFn.cache.clear();
    }
    
    if (memoizedFn && memoizedFn.timestamps instanceof Map) {
      memoizedFn.timestamps.clear();
    }
  };
  
  export default {
    memoize,
    memoizeWithTTL,
    memoizeAsync,
    memoizeAsyncWithTTL,
    clearMemoizeCache
  };
  