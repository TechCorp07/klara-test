// src/app/(dashboard)/admin/common/Pagination.tsx
'use client';

import { useMemo } from 'react';

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
  current_page?: number;
  total_pages?: number;
}

interface PaginationProps {
  pagination: PaginationInfo;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
  showInfo?: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function Pagination({
  pagination,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  showInfo = true,
}: PaginationProps) {
  const totalPages = useMemo(() => {
    return Math.ceil(pagination.count / pageSize);
  }, [pagination.count, pageSize]);

  const startItem = useMemo(() => {
    return (currentPage - 1) * pageSize + 1;
  }, [currentPage, pageSize]);

  const endItem = useMemo(() => {
    return Math.min(currentPage * pageSize, pagination.count);
  }, [currentPage, pageSize, pagination.count]);

  const visiblePages = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 7; // Show up to 7 page numbers
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination logic
      const start = Math.max(1, currentPage - 3);
      const end = Math.min(totalPages, currentPage + 3);
      
      // Always show first page
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push(-1); // Represents ellipsis
        }
      }
      
      // Show pages around current page
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Always show last page
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push(-1); // Represents ellipsis
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  if (pagination.count === 0) {
    return (
      <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200">
        <div className="text-sm text-gray-700">No items to display</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white px-4 py-3 border-t border-gray-200 space-y-3 sm:space-y-0">
      {/* Info and Page Size Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        {showInfo && (
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{pagination.count}</span> results
          </div>
        )}
        
        {showPageSizeSelector && (
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">Show:</label>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-700">per page</span>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          className={`
            px-3 py-2 text-sm font-medium rounded-md
            ${canGoPrevious
              ? 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
              : 'text-gray-300 bg-white border border-gray-300 cursor-not-allowed'
            }
          `}
        >
          Previous
        </button>

        {/* Page Numbers */}
        <div className="hidden sm:flex items-center space-x-1">
          {visiblePages.map((page, index) => {
            if (page === -1) {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-2 text-sm text-gray-400"
                >
                  ...
                </span>
              );
            }

            const isCurrentPage = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`
                  px-3 py-2 text-sm font-medium rounded-md
                  ${isCurrentPage
                    ? 'bg-blue-600 text-white border border-blue-600'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                  }
                `}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Mobile Page Info */}
        <div className="sm:hidden px-3 py-2 text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className={`
            px-3 py-2 text-sm font-medium rounded-md
            ${canGoNext
              ? 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
              : 'text-gray-300 bg-white border border-gray-300 cursor-not-allowed'
            }
          `}
        >
          Next
        </button>
      </div>

      {/* Quick Jump (for large datasets) */}
      {totalPages > 10 && (
        <div className="sm:hidden w-full mt-3">
          <div className="flex items-center justify-center space-x-2">
            <label className="text-sm text-gray-700">Go to page:</label>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = Number(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  onPageChange(page);
                }
              }}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">of {totalPages}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pagination;
