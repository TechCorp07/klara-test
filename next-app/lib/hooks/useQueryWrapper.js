import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';

/**
 * A wrapper around React Query's useQuery for consistent error handling
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