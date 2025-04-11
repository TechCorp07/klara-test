'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { handleApiError } from '../utils/errorHandler';

/**
 * Custom hook for optimized data fetching with error handling and cancellation
 * @param {Function} fetchFn - Async function to fetch data
 * @param {Array} deps - Dependencies array for when to refetch
 * @param {Object} options - Additional options
 * @returns {Object} Fetch state
 */
const useFetch = (fetchFn, deps = [], options = {}) => {
  const {
    initialData = null,
    autoFetch = true,
    errorMessage = 'Failed to fetch data',
    onSuccess = null,
    onError = null,
    showErrorToast = true
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Use a ref for the AbortController to persist across renders
  const abortControllerRef = useRef(null);

  // Fetch data function with error handling
  const fetchData = useCallback(async (params = {}) => {
    // Cancel any in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    // Reset state
    setLoading(true);
    setError(null);

    try {
      // Pass AbortController signal to fetch function if it accepts it
      const result = await fetchFn(params, { signal });
      
      // Only update state if the request wasn't aborted
      if (!signal.aborted) {
        setData(result);
        setLoading(false);
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(result);
        }
      }
      
      return result;
    } catch (err) {
      // Only update state if the request wasn't aborted
      if (!signal.aborted) {
        // Don't treat aborted requests as errors
        if (err.name !== 'AbortError') {
          const errorObj = handleApiError(err, errorMessage, showErrorToast);
          setError(errorObj);
          
          // Call onError callback if provided
          if (onError) {
            onError(errorObj);
          }
        }
        
        setLoading(false);
      }
      
      // Rethrow error for caller handling
      throw err;
    }
  }, [fetchFn, errorMessage, showErrorToast, onSuccess, onError]);

  // Retry fetch function
  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset to initial state
  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
    setRetryCount(0);
  }, [initialData]);

  // Automatically fetch data when dependencies change
  useEffect(() => {
    // Only fetch if autoFetch is true or we're retrying
    if (autoFetch || retryCount > 0) {
      fetchData().catch(() => {
        // Error already handled in fetchData
      });
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [...deps, retryCount]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    retry,
    clearError,
    reset
  };
};

export default useFetch;
