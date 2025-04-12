'use client';

import React, { forwardRef, useState } from 'react';
import Link from 'next/link';
import { FaTimes, FaExclamationTriangle, FaExclamationCircle, FaInfoCircle, FaLock } from 'react-icons/fa';

// ----- Status Badge Component -----

/**
 * Unified status badge component for displaying status with appropriate colors
 * @param {Object} props
 * @param {string} props.status - Status text to display
 * @param {string} props.type - Status type for custom styling
 * @param {string} props.size - Badge size ('small', 'default', 'large')
 */
export function StatusBadge({ status, type = 'default', size = 'default' }) {
  // Status color mappings
  const statusColors = {
    // Status types
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    default: 'bg-gray-100 text-gray-800',
    
    // Common status words
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    scheduled: 'bg-green-100 text-green-800',
    processing: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
    critical: 'bg-red-100 text-red-800',
    normal: 'bg-green-100 text-green-800',
    abnormal: 'bg-yellow-100 text-yellow-800',
    positive: 'bg-red-100 text-red-800',
    negative: 'bg-green-100 text-green-800',
  };

  // Size classes
  const sizeClasses = {
    small: 'px-1.5 py-0.5 text-xs',
    default: 'px-2 py-1 text-xs',
    large: 'px-3 py-1.5 text-sm'
  };

  // Determine color class from the status string
  const lowerStatus = status.toLowerCase();
  let colorClass = statusColors[lowerStatus] || statusColors[type] || statusColors.default;
  const sizeClass = sizeClasses[size] || sizeClasses.default;

  // Format the status text (capitalize first letter)
  const formattedStatus = typeof status === 'string' 
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : status;

  return (
    <span className={`${colorClass} ${sizeClass} rounded-full font-medium`}>
      {formattedStatus}
    </span>
  );
}

// ----- Modal Component -----

/**
 * Unified modal component for consistent dialog presentation
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {string} props.title - Title of the modal
 * @param {React.ReactNode} props.children - Content of the modal
 * @param {string} props.size - Size of the modal ('sm', 'md', 'lg', 'xl')
 * @param {boolean} props.closeOnClickOutside - Whether to close the modal when clicking outside
 * @param {React.ReactNode} props.footer - Footer content for the modal
 */
export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md', 
  closeOnClickOutside = true,
  footer = null
}) {
  const modalRef = React.useRef(null);

  // Close on escape key press
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);
  
  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Handle click outside
  const handleClickOutside = (e) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Get modal width based on size
  const getModalWidth = () => {
    switch (size) {
      case 'sm': return 'max-w-sm';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      case '3xl': return 'max-w-3xl';
      case '4xl': return 'max-w-4xl';
      case 'full': return 'max-w-full';
      case 'md':
      default: return 'max-w-md';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby={title ? 'modal-title' : undefined}
      role="dialog"
      aria-modal="true"
      onClick={handleClickOutside}
    >
      {/* Background overlay */}
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      
      <div className="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
        {/* Modal panel */}
        <div 
          ref={modalRef}
          className={`relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${getModalWidth()} w-full`}
        >
          {/* Close button */}
          <button
            type="button"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes className="h-5 w-5" />
          </button>
          
          {/* Header */}
          {title && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 
                className="text-lg font-medium text-gray-900" 
                id="modal-title"
              >
                {title}
              </h3>
            </div>
          )}
          
          {/* Body */}
          <div className="px-6 py-4">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----- Page Header Component -----

/**
 * Standard page header component with title, subtitle, and optional action button
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle
 * @param {string} props.actionLabel - Action button label
 * @param {string} props.actionUrl - Action button URL
 * @param {Function} props.onActionClick - Action button click handler
 * @param {string} props.backUrl - Back button URL
 * @param {string} props.backLabel - Back button label
 */
export function PageHeader({ 
  title, 
  subtitle, 
  actionLabel, 
  actionUrl, 
  onActionClick,
  backUrl,
  backLabel = 'Back'
}) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}
      </div>
      
      <div className="flex space-x-3">
        {backUrl && (
          <Link
            href={backUrl}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {backLabel}
          </Link>
        )}
        
        {(actionLabel && (actionUrl || onActionClick)) && (
          actionUrl ? (
            <Link
              href={actionUrl}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onActionClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {actionLabel}
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ----- Empty State Component -----

/**
 * Unified empty state component for displaying when no data is available
 * @param {Object} props
 * @param {string} props.message - Message to display
 * @param {React.ReactNode} props.icon - Optional icon component
 * @param {string} props.actionLabel - Action button label
 * @param {string} props.actionUrl - Action button URL
 * @param {Function} props.onAction - Action button click handler
 */
export function EmptyState({ 
  message = 'No data found', 
  icon: Icon = null,
  actionLabel,
  actionUrl,
  onAction
}) {
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow">
      {Icon && <Icon className="mx-auto h-12 w-12 text-gray-400" />}
      <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      
      {(actionLabel && (actionUrl || onAction)) && (
        <div className="mt-6">
          {actionUrl ? (
            <Link
              href={actionUrl}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ----- Filter Bar Component -----

/**
 * Reusable filter bar component for tables
 * @param {Object} props
 * @param {Array} props.filters - Filter configurations
 * @param {Function} props.onFilterChange - Filter change handler
 * @param {Function} props.onSearch - Search handler
 * @param {Function} props.onRefresh - Refresh handler
 */
export function FilterBar({ 
  filters,
  onFilterChange,
  onSearch,
  onRefresh
}) {
  const [searchValue, setSearchValue] = useState('');
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchValue);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
        {filters && filters.map((filter, index) => (
          <div key={index}>
            <label htmlFor={filter.id} className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            <select
              id={filter.id}
              value={filter.value}
              onChange={(e) => onFilterChange(filter.id, e.target.value)}
              className="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
        
        {onSearch && (
          <div className="flex-1">
            <form onSubmit={handleSearchSubmit}>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}
        
        {onRefresh && (
          <div className="flex-shrink-0">
            <button
              onClick={onRefresh}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ----- HIPAA Compliance Banner Component -----

/**
 * HIPAA compliance banner component for displaying compliance information
 * @param {Object} props
 * @param {string} props.type - Type of banner ('phi', 'security', 'audit', 'medical')
 * @param {string} props.message - Optional custom message
 * @param {React.ReactNode} props.icon - Optional custom icon
 * @param {string|Date} props.lastAccessed - Optional timestamp for last access
 */
export function HIPAABanner({ 
  type = 'phi', 
  message,
  icon,
  lastAccessed = new Date() 
}) {
  // Define banner content based on type
  const getBannerContent = () => {
    switch(type) {
      case 'security':
        return {
          icon: icon || FaInfoCircle,
          title: 'HIPAA Security Compliance',
          message: message || 'This page contains security settings required for HIPAA compliance. All security changes are logged for compliance purposes.'
        };
      case 'audit':
        return {
          icon: icon || FaInfoCircle,
          title: 'HIPAA Compliance Audit',
          message: message || 'This page provides detailed audit logs of all PHI access events. All access to this information is logged for security and compliance purposes.'
        };
      case 'medical':
        return {
          icon: icon || FaInfoCircle,
          title: 'HIPAA Protected Medical Information',
          message: message || 'This page contains protected medical information. Access to this information is logged and monitored for compliance purposes.'
        };
      case 'phi':
      default:
        return {
          icon: icon || FaLock,
          title: 'HIPAA Protected Health Information',
          message: message || 'This page contains Protected Health Information (PHI) as defined by HIPAA regulations. Access to this information is logged and monitored for compliance purposes.'
        };
    }
  };

  const { icon: Icon, title, message: contentMessage } = getBannerContent();
  
  // Format date for display
  const formatDate = (date) => {
    if (typeof date === 'string') return date;
    return date.toLocaleString();
  };

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5 text-blue-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">{title}</h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>{contentMessage}</p>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Last accessed: {formatDate(lastAccessed)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- Data Table Component -----

/**
 * Reusable data table component with sorting and row actions
 * @param {Object} props
 * @param {Array} props.columns - Table column definitions
 * @param {Array} props.data - Table data
 * @param {Function} props.onRowClick - Row click handler
 * @param {Function} props.onSort - Sort handler
 * @param {string} props.sortField - Current sort field
 * @param {string} props.sortDirection - Current sort direction
 * @param {string} props.emptyMessage - Message to show when no data
 * @param {boolean} props.isLoading - Loading state
 * @param {Object} props.error - Error object
 */
export function DataTable({ 
  columns, 
  data,
  onRowClick,
  onSort,
  sortField,
  sortDirection = 'asc',
  emptyMessage = 'No data available',
  isLoading = false,
  error = null
}) {
  if (isLoading) {
    return (
      <div className="w-full py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 border-r-2 border-blue-500 border-b-2 border-blue-500 border-l-2 border-blue-200"></div>
        <p className="mt-2 text-sm text-gray-500">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
        <p>{typeof error === 'string' ? error : (error.message || 'An error occurred loading the data.')}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                onClick={column.sortable && onSort ? () => onSort(column.accessor) : undefined}
              >
                <div className="flex items-center">
                  {column.header}
                  
                  {column.sortable && sortField === column.accessor && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr 
              key={row.id || rowIndex} 
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                  {column.cell ? column.cell(row) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ----- Pagination Component -----

/**
 * Reusable pagination component
 * @param {Object} props
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Page change handler
 * @param {number} props.totalItems - Total number of items
 * @param {number} props.pageSize - Number of items per page
 * @param {Function} props.onPageSizeChange - Page size change handler
 * @param {Array} props.pageSizeOptions - Available page size options
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100]
}) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    // Always show first page
    pages.push(1);
    
    // Show current page and pages around it
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    // Add ellipsis indicators
    const result = [];
    let prevPage = null;
    
    for (const page of pages) {
      if (prevPage && page - prevPage > 1) {
        result.push('...');
      }
      result.push(page);
      prevPage = page;
    }
    
    return result;
  };
  
  const pageNumbers = getPageNumbers();
  
  // Get displayed item range
  const getItemRange = () => {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);
    return `${start}-${end}`;
  };

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{getItemRange()}</span> of <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        <div>
          <div className="flex items-center space-x-4">
            {/* Page size selector */}
            {onPageSizeChange && (
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-2">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="text-sm border-gray-300 rounded-md"
                >
                  {pageSizeOptions.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Pagination */}
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {pageNumbers.map((page, i) => (
                page === '...' ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      page === currentPage
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                    } text-sm font-medium`}
                  >
                    {page}
                  </button>
                )
              ))}
              
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}