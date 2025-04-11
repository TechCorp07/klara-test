// lib/utils/performance.js

/**
 * Debounce a function to limit how often it can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Whether to invoke immediately
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300, immediate = false) {
    let timeout;
    
    return function executedFunction(...args) {
      const context = this;
      
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      
      const callNow = immediate && !timeout;
      
      clearTimeout(timeout);
      
      timeout = setTimeout(later, wait);
      
      if (callNow) func.apply(context, args);
    };
  }
  
  /**
   * Throttle a function to limit its execution rate
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  export function throttle(func, limit = 300) {
    let lastCall;
    let lastRan;
    
    return function executedFunction(...args) {
      const context = this;
      const now = Date.now();
      
      if (!lastRan) {
        func.apply(context, args);
        lastRan = now;
        return;
      }
      
      clearTimeout(lastCall);
      
      lastCall = setTimeout(function() {
        if ((now - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = now;
        }
      }, limit - (now - lastRan));
    };
  }
  
  /**
   * Compare objects deeply for equality (for use in React.memo or useMemo)
   * @param {Object} objA - First object
   * @param {Object} objB - Second object
   * @returns {boolean} Whether objects are equal
   */
  export function deepEqual(objA, objB) {
    if (objA === objB) {
      return true;
    }
    
    if (
      typeof objA !== 'object' ||
      objA === null ||
      typeof objB !== 'object' ||
      objB === null
    ) {
      return false;
    }
    
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    
    if (keysA.length !== keysB.length) {
      return false;
    }
    
    for (let i = 0; i < keysA.length; i++) {
      const key = keysA[i];
      
      if (!Object.prototype.hasOwnProperty.call(objB, key)) {
        return false;
      }
      
      if (!deepEqual(objA[key], objB[key])) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Shallow compare props for React.memo optimization
   * Only compares top-level properties
   * @param {Object} prevProps - Previous props
   * @param {Object} nextProps - Next props
   * @returns {boolean} Whether props are equal
   */
  export function shallowEqual(prevProps, nextProps) {
    if (prevProps === nextProps) {
      return true;
    }
    
    if (
      typeof prevProps !== 'object' ||
      prevProps === null ||
      typeof nextProps !== 'object' ||
      nextProps === null
    ) {
      return false;
    }
    
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);
    
    if (prevKeys.length !== nextKeys.length) {
      return false;
    }
    
    return prevKeys.every(key => 
      Object.prototype.hasOwnProperty.call(nextProps, key) &&
      prevProps[key] === nextProps[key]
    );
  }
  
  /**
   * Create a custom memo comparison function for specific props
   * @param {Array} propsToCompare - Array of prop names to compare
   * @returns {Function} Comparison function for React.memo
   */
  export function createPropsComparator(propsToCompare = []) {
    return (prevProps, nextProps) => {
      if (propsToCompare.length === 0) {
        return shallowEqual(prevProps, nextProps);
      }
      
      return propsToCompare.every(prop => 
        prevProps[prop] === nextProps[prop]
      );
    };
  }
  
  /**
   * Create a deep props comparator for complex data structures
   * @param {Array} deepProps - Array of prop names to compare deeply
   * @param {Array} shallowProps - Array of prop names to compare shallowly
   * @returns {Function} Comparison function for React.memo
   */
  export function createDeepPropsComparator(deepProps = [], shallowProps = []) {
    return (prevProps, nextProps) => {
      // Check shallow props first (faster)
      const shallowPropsEqual = shallowProps.length === 0 || 
        shallowProps.every(prop => prevProps[prop] === nextProps[prop]);
        
      if (!shallowPropsEqual) {
        return false;
      }
      
      // Then check deep props
      return deepProps.every(prop => 
        deepEqual(prevProps[prop], nextProps[prop])
      );
    };
  }
  
  /**
   * Measure performance of a function
   * @param {Function} fn - Function to measure
   * @param {Array} args - Arguments to pass to the function
   * @param {string} label - Label for console output
   * @returns {*} Result of the function
   */
  export function measure(fn, args = [], label = 'Performance') {
    if (process.env.NODE_ENV !== 'production') {
      console.time(label);
      const result = fn(...args);
      console.timeEnd(label);
      return result;
    }
    
    return fn(...args);
  }
  
  /**
   * Measure performance of an async function
   * @param {Function} asyncFn - Async function to measure
   * @param {Array} args - Arguments to pass to the function
   * @param {string} label - Label for console output
   * @returns {Promise<*>} Result of the async function
   */
  export async function measureAsync(asyncFn, args = [], label = 'Async Performance') {
    if (process.env.NODE_ENV !== 'production') {
      console.time(label);
      try {
        const result = await asyncFn(...args);
        console.timeEnd(label);
        return result;
      } catch (error) {
        console.timeEnd(label);
        throw error;
      }
    }
    
    return asyncFn(...args);
  }
  
  /**
   * Check if the code is running on the client side
   * @returns {boolean} Whether code is running on client
   */
  export function isClient() {
    return typeof window !== 'undefined';
  }
  
  /**
   * Check if the code is running on the server side
   * @returns {boolean} Whether code is running on server
   */
  export function isServer() {
    return typeof window === 'undefined';
  }
  
  /**
   * Batch multiple state updates to reduce renders
   * @param {Function} callback - Function containing state updates
   */
  export function batchUpdates(callback) {
    if (typeof window !== 'undefined' && window.ReactDOM) {
      window.ReactDOM.unstable_batchedUpdates(callback);
    } else {
      // Fallback if ReactDOM is not available
      callback();
    }
  }
  
  export default {
    debounce,
    throttle,
    deepEqual,
    shallowEqual,
    createPropsComparator,
    createDeepPropsComparator,
    measure,
    measureAsync,
    isClient,
    isServer,
    batchUpdates
  };