import { useState } from 'react';
import { useFilters } from '@/utils/hooks';
import { usePagination } from '@/utils/hooks';
import { useSorting } from '@/utils/hooks';
import { combineParams } from '@/utils/queryHelpers';
import { useQueryWrapper } from '@/useQueryWrapper';

/**
 * Custom hook for managing data tables with filtering, sorting, and pagination
 * 
 * @param {Object} options - Options for the data table
 * @returns {Object} Data table state and handlers
 */
export function useDataTable(options) {
  const {
    queryKey,
    fetchFn,
    initialFilters = {},
    initialSort = '',
    initialSortDirection = 'asc',
    initialPage = 1,
    initialRowsPerPage = 10,
    onError
  } = options;
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use our custom hooks for filtering, sorting, and pagination
  const {
    filters,
    handleFilterChange,
    resetFilters,
    filterParams
  } = useFilters(initialFilters);
  
  const {
    sortField,
    sortDirection,
    handleSort,
    sortParams
  } = useSorting(initialSort, initialSortDirection);
  
  const {
    page,
    rowsPerPage,
    pageCount,
    totalItems,
    setTotalItems,
    handlePageChange,
    handleRowsPerPageChange,
    paginationParams
  } = usePagination(initialPage, initialRowsPerPage);
  
  // Combine all params
  const queryParams = combineParams(
    filterParams,
    sortParams,
    paginationParams,
    searchTerm ? { search: searchTerm } : {}
  );
  
  // Fetch data with React Query
  const query = useQueryWrapper(
    [...queryKey, queryParams],
    () => fetchFn(queryParams),
    {
      onSuccess: (data) => {
        if (data.total_count !== undefined) {
          setTotalItems(data.total_count);
        } else if (data.count !== undefined) {
          setTotalItems(data.count);
        } else if (Array.isArray(data)) {
          setTotalItems(data.length);
        }
      },
      onError
    }
  );
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchValue = formData.get('search') || '';
    setSearchTerm(searchValue);
    handlePageChange(1); // Reset to first page on new search
  };
  
  const handleRefresh = () => {
    query.refetch();
  };
  
  return {
    // Data
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    
    // Filter state
    filters,
    handleFilterChange,
    resetFilters,
    
    // Search state
    searchTerm,
    setSearchTerm,
    handleSearch,
    
    // Sort state
    sortField,
    sortDirection,
    handleSort,
    
    // Pagination state
    page,
    rowsPerPage,
    pageCount,
    totalItems,
    handlePageChange,
    handleRowsPerPageChange,
    
    // Other utilities
    handleRefresh
  };
}