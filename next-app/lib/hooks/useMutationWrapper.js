import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

/**
 * A wrapper around React Query's useMutation for consistent success/error handling
 * 
 * @param {Function} mutationFn - The mutation function
 * @param {Object} options - Additional options for useMutation
 * @returns {Object} The mutation result
 */
export function useMutationWrapper(mutationFn, options = {}) {
  const queryClient = useQueryClient();
  
  const defaultOptions = {
    onSuccess: (data, variables) => {
      const successMessage = options.successMessage || 'Operation completed successfully.';
      toast.success(successMessage);
      
      // Invalidate queries if specified
      if (options.invalidateQueries) {
        if (Array.isArray(options.invalidateQueries)) {
          options.invalidateQueries.forEach(query => {
            queryClient.invalidateQueries(query);
          });
        } else {
          queryClient.invalidateQueries(options.invalidateQueries);
        }
      }
      
      // Call custom onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      const errorMessage = error.response?.data?.message || options.errorMessage || 'An error occurred during the operation.';
      toast.error(errorMessage);
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