// src/app/(dashboard)/admin/common/UserFilters.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export interface UserFilters {
  page: number;
  page_size: number;
  search: string;
  role: string;
  is_active?: boolean;
  is_approved?: boolean;
  is_locked?: boolean;
  verification_status?: string;
  date_joined_after?: string;
  date_joined_before?: string;
  last_login_after?: string;
  last_login_before?: string;
  ordering: string;
}

interface UserFiltersProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  showAdvanced?: boolean;
}

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'patient', label: 'Patient' },
  { value: 'provider', label: 'Healthcare Provider' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'compliance', label: 'Compliance Officer' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'pharmco', label: 'Pharmaceutical Company' },
  { value: 'admin', label: 'Administrator' },
];

const VERIFICATION_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'verified', label: 'Verified' },
  { value: 'pending', label: 'Pending Verification' },
  { value: 'expired', label: 'Verification Expired' },
  { value: 'not_required', label: 'Not Required' },
];

const ORDERING_OPTIONS = [
  { value: '-date_joined', label: 'Newest First' },
  { value: 'date_joined', label: 'Oldest First' },
  { value: '-last_login', label: 'Recent Login' },
  { value: 'last_login', label: 'Oldest Login' },
  { value: 'username', label: 'Username A-Z' },
  { value: '-username', label: 'Username Z-A' },
  { value: 'email', label: 'Email A-Z' },
  { value: '-email', label: 'Email Z-A' },
];

export function UserFilters({ filters, onFiltersChange, showAdvanced = false }: UserFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(showAdvanced);
  const [localFilters, setLocalFilters] = useState(filters);

  const updateFilter = (key: keyof UserFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value, page: 1 };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: UserFilters = {
      page: 1,
      page_size: filters.page_size,
      search: '',
      role: '',
      is_active: undefined,
      is_approved: undefined,
      is_locked: undefined,
      verification_status: '',
      date_joined_after: '',
      date_joined_before: '',
      last_login_after: '',
      last_login_before: '',
      ordering: '-date_joined',
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = () => {
    return !!(
      filters.search ||
      filters.role ||
      filters.is_active !== undefined ||
      filters.is_approved !== undefined ||
      filters.is_locked !== undefined ||
      filters.verification_status ||
      filters.date_joined_after ||
      filters.date_joined_before ||
      filters.last_login_after ||
      filters.last_login_before
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filter Users</h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            {isAdvancedOpen ? 'Hide' : 'Show'} Advanced
          </button>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={localFilters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Username, email, name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            value={localFilters.role}
            onChange={(e) => updateFilter('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Status
          </label>
          <select
            value={
              localFilters.is_active === undefined ? '' :
              localFilters.is_active ? 'active' : 'inactive'
            }
            onChange={(e) => updateFilter('is_active', 
              e.target.value === '' ? undefined :
              e.target.value === 'active'
            )}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Ordering */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            value={localFilters.ordering}
            onChange={(e) => updateFilter('ordering', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ORDERING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {isAdvancedOpen && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Approval Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approval Status
              </label>
              <select
                value={
                  localFilters.is_approved === undefined ? '' :
                  localFilters.is_approved ? 'approved' : 'pending'
                }
                onChange={(e) => updateFilter('is_approved', 
                  e.target.value === '' ? undefined :
                  e.target.value === 'approved'
                )}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending Approval</option>
              </select>
            </div>

            {/* Lock Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lock Status
              </label>
              <select
                value={
                  localFilters.is_locked === undefined ? '' :
                  localFilters.is_locked ? 'locked' : 'unlocked'
                }
                onChange={(e) => updateFilter('is_locked', 
                  e.target.value === '' ? undefined :
                  e.target.value === 'locked'
                )}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="unlocked">Unlocked</option>
                <option value="locked">Locked</option>
              </select>
            </div>

            {/* Verification Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Status
              </label>
              <select
                value={localFilters.verification_status || ''}
                onChange={(e) => updateFilter('verification_status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {VERIFICATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Joined Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Date Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={localFilters.date_joined_after || ''}
                  onChange={(e) => updateFilter('date_joined_after', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={localFilters.date_joined_before || ''}
                  onChange={(e) => updateFilter('date_joined_before', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="To"
                />
              </div>
            </div>

            {/* Last Login Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Login Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={localFilters.last_login_after || ''}
                  onChange={(e) => updateFilter('last_login_after', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={localFilters.last_login_before || ''}
                  onChange={(e) => updateFilter('last_login_before', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="To"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: {filters.search}
                <button
                  onClick={() => updateFilter('search', '')}
                  className="ml-1 text-blue-600 hover:text-blue-500"
                >
                  ×
                </button>
              </span>
            )}
            {filters.role && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Role: {ROLE_OPTIONS.find(r => r.value === filters.role)?.label}
                <button
                  onClick={() => updateFilter('role', '')}
                  className="ml-1 text-green-600 hover:text-green-500"
                >
                  ×
                </button>
              </span>
            )}
            {filters.is_approved !== undefined && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {filters.is_approved ? 'Approved' : 'Pending Approval'}
                <button
                  onClick={() => updateFilter('is_approved', undefined)}
                  className="ml-1 text-yellow-600 hover:text-yellow-500"
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
