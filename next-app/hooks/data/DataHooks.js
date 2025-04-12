'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { handleApiError } from '@/utils/errorHandler';

/**
 * A unified data hook that provides a consistent API for data fetching, 
 * including loading, error handling, pagination, filtering, and sorting
 * 
 * @param {Object} options - Options for data fetching
 * @returns {Object} Data and helper functions
 */
export function useData(options) {
  const {
    queryKey,
    queryFn,
    initialData = null,
    initialPage = 1,
    initialPageSize = 10,
    initialSort = null,
    initialSortDirection = 'asc',
    initialFilters = {},
    onSuccess = null,
    onError = null,
    enablePagination = true,
    enableSorting = true,
    enableFiltering = true,
    errorMessage = 'Failed to fetch data',
    successMessage = null,
    showSuccessToast = false,
    showErrorToast = true,
    ...queryOptions
  } = options;

  // State for pagination
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // State for sorting
  const [sortField, setSortField] = useState(initialSort);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  
  // State for filtering
  const [filters, setFilters] = useState(initialFilters);
  
  // Build params for query
  const buildQueryParams = useCallback(() => {
    const params = {};
    
    // Add pagination params
    if (enablePagination) {
      params.page = page;
      params.limit = pageSize;
    }
    
    // Add sorting params
    if (enableSorting && sortField) {
      params.sort = sortField;
      params.direction = sortDirection;
    }
    
    // Add filter params
    if (enableFiltering && Object.keys(filters).length > 0) {
      // Filter out empty values
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params[key] = value;
        }
      });
    }
    
    return params;
  }, [page, pageSize, sortField, sortDirection, filters, enablePagination, enableSorting, enableFiltering]);
  
  // Data fetching with React Query
  const query = useQuery({
    queryKey: Array.isArray(queryKey) ? [...queryKey, page, pageSize, sortField, sortDirection, filters] : [queryKey, page, pageSize, sortField, sortDirection, filters],
    queryFn: () => queryFn(buildQueryParams()),
    initialData,
    onSuccess: (data) => {
      // Handle pagination data
      if (data && typeof data === 'object') {
        // Detect pagination format
        if (data.total_count !== undefined) {
          setTotalItems(data.total_count);
          setTotalPages(Math.ceil(data.total_count / pageSize));
        } else if (data.count !== undefined) {
          setTotalItems(data.count);
          setTotalPages(Math.ceil(data.count / pageSize));
        } else if (data.pagination && data.pagination.total !== undefined) {
          setTotalItems(data.pagination.total);
          setTotalPages(data.pagination.pages || Math.ceil(data.pagination.total / pageSize));
        }
      }
      
      // Show success toast if enabled
      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }
      
      // Call custom onSuccess if provided
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      // Show error toast if enabled
      if (showErrorToast) {
        toast.error(error.message || errorMessage);
      }
      
      // Call custom onError if provided
      if (onError) {
        onError(error);
      }
    },
    ...queryOptions
  });
  
  // Pagination handlers
  const goToPage = useCallback((newPage) => {
    if (newPage >= 1 && (totalPages === 0 || newPage <= totalPages)) {
      setPage(newPage);
    }
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    goToPage(page + 1);
  }, [page, goToPage]);
  
  const prevPage = useCallback(() => {
    goToPage(page - 1);
  }, [page, goToPage]);
  
  const setPageSizeWithReset = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  }, []);
  
  // Sorting handlers
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);
  
  // Filtering handlers
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1); // Reset to first page when changing filters
  }, []);
  
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setPage(1); // Reset to first page when resetting filters
  }, [initialFilters]);
  
  // Search handler
  const handleSearch = useCallback((searchTerm) => {
    handleFilterChange('search', searchTerm);
  }, [handleFilterChange]);
  
  return {
    // Data state
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    
    // Pagination state
    page,
    pageSize,
    totalItems,
    totalPages,
    
    // Pagination handlers
    goToPage,
    nextPage,
    prevPage,
    setPageSize: setPageSizeWithReset,
    
    // Sorting state
    sortField,
    sortDirection,
    
    // Sorting handlers
    handleSort,
    
    // Filtering state
    filters,
    
    // Filtering handlers
    handleFilterChange,
    resetFilters,
    
    // Search handler
    handleSearch
  };
}

/**
 * Custom hook for data fetching with React Query and consistent error handling
 * 
 * @param {string|Array} queryKey - The query key for React Query
 * @param {Function} queryFn - The query function
 * @param {Object} options - Additional options for useQuery
 * @returns {Object} The query result
 */
export function useQueryWrapper(queryKey, queryFn, options = {}) {
  const defaultOptions = {
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'An error occurred while fetching data.';
      toast.error(errorMessage);
      console.error('Query error:', error);
    },
    ...options
  };

  return useQuery({
    queryKey,
    queryFn,
    ...defaultOptions
  });
}

/**
 * Custom hook for data mutations with React Query and consistent success/error handling
 * 
 * @param {Function} mutationFn - The mutation function
 * @param {Object} options - Additional options for useMutation
 * @returns {Object} The mutation result
 */
export function useMutationWrapper(mutationFn, options = {}) {  
  const defaultOptions = {
    onSuccess: (data, variables) => {
      const successMessage = options.successMessage || 'Operation completed successfully.';
      
      if (options.showSuccessToast !== false) {
        toast.success(successMessage);
      }
      
      // Call custom onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      const errorMessage = error.message || options.errorMessage || 'An error occurred during the operation.';
      
      if (options.showErrorToast !== false) {
        toast.error(errorMessage);
      }
      
      console.error('Mutation error:', error);
      
      // Call custom onError if provided
      if (options.onError) {
        options.onError(error, variables);
      }
    },
    ...options
  };

  return useMutation({
    mutationFn,
    ...defaultOptions
  });
}

/**
 * Custom hook for data fetching with fetch API and consistent error handling
 * 
 * @param {Function} fetchFn - Async function to fetch data
 * @param {Array} deps - Dependencies array for when to refetch
 * @param {Object} options - Additional options
 * @returns {Object} Fetch state
 */
export function useFetch(fetchFn, deps = [], options = {}) {
  const {
    initialData = null,
    autoFetch = true,
    errorMessage = 'Failed to fetch data',
    onSuccess = null,
    onError = null,
    showErrorToast = true,
    showSuccessToast = false,
    successMessage = null
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
        
        // Show success toast if enabled
        if (showSuccessToast && successMessage) {
          toast.success(successMessage);
        }
        
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
  }, [fetchFn, errorMessage, showErrorToast, showSuccessToast, successMessage, onSuccess, onError]);

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
}