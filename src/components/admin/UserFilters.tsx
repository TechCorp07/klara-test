// src/components/admin/UserFilters.tsx
'use client';
import { UserFilters as UserFiltersType } from '@/types/admin.types';

interface UserFiltersProps {
  onFiltersChange: (filters: UserFiltersType) => void;
  currentFilters: UserFiltersType;
}

export const UserFilters = ({ onFiltersChange, currentFilters }: UserFiltersProps) => {
  const handleInputChange = (key: keyof UserFiltersType, value: string | boolean | undefined) => {
    onFiltersChange({
      ...currentFilters,
      [key]: value,
      page: 1, // Reset to first page when filters change
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Search & Filter Users</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Users
          </label>
          <input
            type="text"
            placeholder="Search by name, email..."
            value={currentFilters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Role
          </label>
          <select
            value={currentFilters.role || ''}
            onChange={(e) => handleInputChange('role', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="patient">Patient</option>
            <option value="provider">Healthcare Provider</option>
            <option value="researcher">Researcher</option>
            <option value="pharmco">Pharmaceutical Company</option>
            <option value="caregiver">Caregiver</option>
            <option value="compliance">Compliance Officer</option>
            <option value="admin">Administrator</option>
          </select>
        </div>

        {/* Approval Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Approval Status
          </label>
          <select
            value={currentFilters.is_approved?.toString() || ''}
            onChange={(e) => {
              const value = e.target.value;
              handleInputChange(
                'is_approved', 
                value === '' ? undefined : value === 'true'
              );
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="true">Approved</option>
            <option value="false">Pending Approval</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={currentFilters.ordering || ''}
            onChange={(e) => handleInputChange('ordering', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="-date_joined">Newest First</option>
            <option value="date_joined">Oldest First</option>
            <option value="email">Email A-Z</option>
            <option value="-email">Email Z-A</option>
            <option value="first_name">First Name A-Z</option>
            <option value="-first_name">First Name Z-A</option>
            <option value="role">Role A-Z</option>
            <option value="-role">Role Z-A</option>
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onFiltersChange({ page: 1, page_size: 25 })}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};