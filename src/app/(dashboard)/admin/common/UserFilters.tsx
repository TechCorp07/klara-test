// src/app/(dashboard)/admin/common/UserFilters.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface UserFiltersType {
  page: number;
  page_size: number;
  search: string;
  role: string;
  is_active?: boolean;
  is_approved?: boolean;
  is_locked?: boolean;
  ordering: string;
}

interface UserFiltersProps {
  filters: UserFiltersType;
  onFilterChange: (filters: Partial<UserFiltersType>) => void;
}

export default function UserFilters({ filters, onFilterChange }: UserFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFilterChange({ search: localSearch });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, filters.search, onFilterChange]);

  const handleFilterChange = (key: keyof UserFiltersType, value: any) => {
    onFilterChange({ [key]: value });
  };

  const clearFilters = () => {
    setLocalSearch('');
    onFilterChange({
      search: '',
      role: '',
      is_active: undefined,
      is_approved: undefined,
      is_locked: undefined,
      ordering: '-date_joined',
      page: 1,
    });
  };

  const hasActiveFilters = filters.search || filters.role || 
    filters.is_active !== undefined || filters.is_approved !== undefined || 
    filters.is_locked !== undefined;

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Clear All Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Search */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by name, email, username..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="patient">Patient</option>
            <option value="provider">Provider</option>
            <option value="admin">Admin</option>
            <option value="researcher">Researcher</option>
            <option value="caregiver">Caregiver</option>
            <option value="compliance">Compliance</option>
            <option value="pharmco">Pharmaceutical</option>
          </select>
        </div>

        {/* Active Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.is_active === undefined ? '' : filters.is_active.toString()}
            onChange={(e) => handleFilterChange('is_active', 
              e.target.value === '' ? undefined : e.target.value === 'true'
            )}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Approval Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Approval
          </label>
          <select
            value={filters.is_approved === undefined ? '' : filters.is_approved.toString()}
            onChange={(e) => handleFilterChange('is_approved', 
              e.target.value === '' ? undefined : e.target.value === 'true'
            )}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Approvals</option>
            <option value="true">Approved</option>
            <option value="false">Pending</option>
          </select>
        </div>

        {/* Lock Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lock Status
          </label>
          <select
            value={filters.is_locked === undefined ? '' : filters.is_locked.toString()}
            onChange={(e) => handleFilterChange('is_locked', 
              e.target.value === '' ? undefined : e.target.value === 'true'
            )}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Lock Status</option>
            <option value="false">Unlocked</option>
            <option value="true">Locked</option>
          </select>
        </div>
      </div>

      {/* Sort Options */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <label className="block text-sm font-medium text-gray-700">
            Sort by:
          </label>
          <select
            value={filters.ordering}
            onChange={(e) => handleFilterChange('ordering', e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="-date_joined">Newest First</option>
            <option value="date_joined">Oldest First</option>
            <option value="username">Username A-Z</option>
            <option value="-username">Username Z-A</option>
            <option value="email">Email A-Z</option>
            <option value="-email">Email Z-A</option>
            <option value="-last_login">Last Login (Recent)</option>
            <option value="last_login">Last Login (Oldest)</option>
          </select>

          <label className="block text-sm font-medium text-gray-700">
            Per page:
          </label>
          <select
            value={filters.page_size}
            onChange={(e) => handleFilterChange('page_size', parseInt(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: "{filters.search}"
                <button
                  onClick={() => {
                    setLocalSearch('');
                    handleFilterChange('search', '');
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-500"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters.role && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Role: {filters.role}
                <button
                  onClick={() => handleFilterChange('role', '')}
                  className="ml-2 text-green-600 hover:text-green-500"
                >
                  ×
                </button>
              </span>
            )}

            {filters.is_active !== undefined && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Status: {filters.is_active ? 'Active' : 'Inactive'}
                <button
                  onClick={() => handleFilterChange('is_active', undefined)}
                  className="ml-2 text-purple-600 hover:text-purple-500"
                >
                  ×
                </button>
              </span>
            )}

            {filters.is_approved !== undefined && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Approval: {filters.is_approved ? 'Approved' : 'Pending'}
                <button
                  onClick={() => handleFilterChange('is_approved', undefined)}
                  className="ml-2 text-yellow-600 hover:text-yellow-500"
                >
                  ×
                </button>
              </span>
            )}

            {filters.is_locked !== undefined && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Lock: {filters.is_locked ? 'Locked' : 'Unlocked'}
                <button
                  onClick={() => handleFilterChange('is_locked', undefined)}
                  className="ml-2 text-red-600 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
