import { useState, useEffect } from 'react';

/**
 * Custom hook for handling form state
 * @param {Object} initialValues - Initial form values
 * @param {Function} validateFn - Validation function
 * @returns {Object} Form state and handlers
 */
export function useForm(initialValues, validateFn = () => ({})) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validate form values
  useEffect(() => {
    if (isSubmitting) {
      const validationErrors = validateFn(values);
      setErrors(validationErrors);
      setIsSubmitting(Object.keys(validationErrors).length === 0);
    }
  }, [isSubmitting, values, validateFn]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues({
      ...values,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle input blur
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
    
    // Validate field on blur
    const fieldErrors = validateFn({ [name]: values[name] });
    setErrors({
      ...errors,
      ...fieldErrors
    });
  };
  
  // Handle form reset
  const handleReset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };
  
  // Handle form submission
  const handleSubmit = (onSubmit) => (e) => {
    e.preventDefault();
    setTouched(
      Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {})
    );
    setIsSubmitting(true);
    
    const validationErrors = validateFn(values);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(values);
    }
  };
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleReset,
    handleSubmit,
    setValues
  };
}

/**
 * Custom hook for handling pagination
 * @param {number} initialPage - Initial page
 * @param {number} initialRowsPerPage - Initial rows per page
 * @returns {Object} Pagination state and handlers
 */
export function usePagination(initialPage = 1, initialRowsPerPage = 10) {
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [totalItems, setTotalItems] = useState(0);
  
  const pageCount = Math.ceil(totalItems / rowsPerPage);
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pageCount) {
      setPage(newPage);
    }
  };
  
  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reset to first page
  };
  
  const paginationParams = {
    page,
    limit: rowsPerPage
  };
  
  return {
    page,
    rowsPerPage,
    pageCount,
    totalItems,
    setTotalItems,
    handlePageChange,
    handleRowsPerPageChange,
    paginationParams
  };
}

/**
 * Custom hook for handling sorting
 * @param {string} initialSortField - Initial sort field
 * @param {string} initialSortDirection - Initial sort direction ('asc' or 'desc')
 * @returns {Object} Sorting state and handlers
 */
export function useSorting(initialSortField = '', initialSortDirection = 'asc') {
  const [sortField, setSortField] = useState(initialSortField);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  
  const handleSort = (field) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const sortParams = sortField 
    ? { sort: sortField, order: sortDirection } 
    : {};
  
  return {
    sortField,
    sortDirection,
    handleSort,
    sortParams
  };
}

/**
 * Custom hook for handling filters
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Filter state and handlers
 */
export function useFilters(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);
  
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const resetFilters = () => {
    setFilters(initialFilters);
  };
  
  // Remove empty filters for API calls
  const filterParams = Object.entries(filters)
    .reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        acc[key] = value;
      }
      return acc;
    }, {});
  
  return {
    filters,
    setFilters,
    handleFilterChange,
    resetFilters,
    filterParams
  };
}