// src/app/(dashboard)/patient/health-records/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { usePatientHealthRecords } from '@/hooks/patient/usePatientHealthRecords';
import { Spinner } from '@/components/ui/spinner';

interface HealthRecord {
  id: number;
  record_type: 'lab_result' | 'imaging' | 'visit_note' | 'test_result' | 'prescription' | 'vaccination' | 'procedure' | 'discharge_summary';
  title: string;
  date: string;
  provider: {
    id: number;
    name: string;
    specialty: string;
  };
  status: 'final' | 'preliminary' | 'pending' | 'amended' | 'cancelled';
  has_attachments: boolean;
  is_critical: boolean;
  summary?: string;
  document_url?: string;
}

interface RecordFilters {
  recordType: string;
  startDate: string;
  endDate: string;
  provider: string;
  status: string;
}

export default function HealthRecordsPage() {
  const searchParams = useSearchParams();
  const { records, summary, loading, error, refetch, downloadRecord } = usePatientHealthRecords();
  
  const [filteredRecords, setFilteredRecords] = useState<HealthRecord[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [filters, setFilters] = useState<RecordFilters>({
    recordType: searchParams?.get('filter') || '',
    startDate: '',
    endDate: '',
    provider: '',
    status: '',
  });

  // Filter records based on current filters
  useEffect(() => {
    let filtered = [...records];

    if (filters.recordType && filters.recordType !== 'all') {
      if (filters.recordType === 'critical') {
        filtered = filtered.filter(record => record.is_critical);
      } else {
        filtered = filtered.filter(record => record.record_type === filters.recordType);
      }
    }

    if (filters.startDate) {
      filtered = filtered.filter(record => new Date(record.date) >= new Date(filters.startDate));
    }

    if (filters.endDate) {
      filtered = filtered.filter(record => new Date(record.date) <= new Date(filters.endDate));
    }

    if (filters.provider) {
      filtered = filtered.filter(record => 
        record.provider.name.toLowerCase().includes(filters.provider.toLowerCase()) ||
        record.provider.specialty.toLowerCase().includes(filters.provider.toLowerCase())
      );
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(record => record.status === filters.status);
    }

    setFilteredRecords(filtered);
  }, [records, filters]);

  // Record type configuration
  const recordTypes = [
    { value: 'all', label: 'All Records', icon: '📋' },
    { value: 'lab_result', label: 'Lab Results', icon: '🧪' },
    { value: 'imaging', label: 'Imaging', icon: '🔬' },
    { value: 'visit_note', label: 'Visit Notes', icon: '📝' },
    { value: 'prescription', label: 'Prescriptions', icon: '💊' },
    { value: 'vaccination', label: 'Vaccinations', icon: '💉' },
    { value: 'procedure', label: 'Procedures', icon: '🏥' },
    { value: 'critical', label: 'Critical Results', icon: '⚠️' },
  ];

  // Get record type info
  const getRecordTypeInfo = (type: string) => {
    const typeConfig = recordTypes.find(t => t.value === type);
    return typeConfig || { value: type, label: type.replace('_', ' '), icon: '📄' };
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'final':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'preliminary':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'amended':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Handle record selection
  const toggleRecordSelection = (recordId: number) => {
    setSelectedRecords(prev =>
      prev.includes(recordId)
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const selectAllRecords = () => {
    setSelectedRecords(filteredRecords.map(record => record.id));
  };

  const clearSelection = () => {
    setSelectedRecords([]);
  };

  // Handle record download
  const handleDownload = async (recordId: number) => {
    try {
      await downloadRecord(recordId);
    } catch (err) {
      console.error('Download failed:', err);
      // Show error toast
    }
  };

  // Handle bulk operations
  const handleBulkDownload = async () => {
    for (const recordId of selectedRecords) {
      try {
        await downloadRecord(recordId);
        // Add small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`Failed to download record ${recordId}:`, err);
      }
    }
    clearSelection();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Loading your health records...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Health Records</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Health Records</h1>
        <p className="mt-2 text-gray-600">
          Access and manage your complete medical history and test results.
        </p>
      </div>

      {/* HIPAA Notice */}
      <div className="mb-6">
        <div className="hipaa-notice">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">Protected Health Information</p>
              <p className="text-sm mt-1">
                All health records are protected under HIPAA. You have the right to access, request amendments, and control sharing of your medical information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{summary.total_records || records.length}</div>
            <div className="text-sm text-gray-600">Total Records</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{summary.recent_records || 0}</div>
            <div className="text-sm text-gray-600">Recent (30 days)</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">{summary.pending_results || 0}</div>
            <div className="text-sm text-gray-600">Pending Results</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{summary.critical_alerts || 0}</div>
            <div className="text-sm text-gray-600">Critical Alerts</div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">Filter Records</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowRequestModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Request Records
              </button>
              {selectedRecords.length > 0 && (
                <button
                  onClick={handleBulkDownload}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Download Selected ({selectedRecords.length})
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Record Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Record Type</label>
              <select
                value={filters.recordType}
                onChange={(e) => setFilters({ ...filters, recordType: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                {recordTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Provider Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
              <input
                type="text"
                placeholder="Search providers..."
                value={filters.provider}
                onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="final">Final</option>
                <option value="preliminary">Preliminary</option>
                <option value="pending">Pending</option>
                <option value="amended">Amended</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setFilters({ ...filters, recordType: 'critical' })}
              className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded text-red-700 bg-red-50 hover:bg-red-100"
            >
              ⚠️ Critical Results
            </button>
            <button
              onClick={() => setFilters({ ...filters, recordType: 'lab_result' })}
              className="inline-flex items-center px-3 py-1.5 border border-green-300 text-sm font-medium rounded text-green-700 bg-green-50 hover:bg-green-100"
            >
              🧪 Lab Results
            </button>
            <button
              onClick={() => setFilters({ ...filters, startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] })}
              className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100"
            >
              📅 Last 30 Days
            </button>
            <button
              onClick={() => setFilters({ recordType: '', startDate: '', endDate: '', provider: '', status: '' })}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Selection Controls */}
      {filteredRecords.length > 0 && (
        <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <button
              onClick={selectedRecords.length === filteredRecords.length ? clearSelection : selectAllRecords}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {selectedRecords.length === filteredRecords.length ? 'Deselect All' : 'Select All'}
            </button>
            {selectedRecords.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedRecords.length} of {filteredRecords.length} selected
              </span>
            )}
          </div>
          <span className="text-sm text-gray-600">
            Showing {filteredRecords.length} records
          </span>
        </div>
      )}

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 mb-4">No health records found</p>
          <p className="text-sm text-gray-400">
            {Object.values(filters).some(f => f) 
              ? 'Try adjusting your filters to see more results'
              : 'Your medical records and test results will appear here'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => {
            const typeInfo = getRecordTypeInfo(record.record_type);
            const isSelected = selectedRecords.includes(record.id);
            
            return (
              <div
                key={record.id}
                className={`bg-white border rounded-lg p-6 transition-all duration-200 ${
                  isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                } ${record.is_critical ? 'border-l-4 border-l-red-500' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  {/* Selection Checkbox */}
                  <div className="flex-shrink-0 pt-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRecordSelection(record.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  {/* Record Type Icon */}
                  <div className="flex-shrink-0">
                    <div className="text-2xl">{typeInfo.icon}</div>
                  </div>

                  {/* Record Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{record.title}</h3>
                          {record.is_critical && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Critical
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}
                          >
                            {record.status}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <span>{typeInfo.label}</span>
                          <span>•</span>
                          <span>{record.provider.name}</span>
                          <span>•</span>
                          <span>{record.provider.specialty}</span>
                          <span>•</span>
                          <span>{new Date(record.date).toLocaleDateString()}</span>
                        </div>

                        {record.summary && (
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                            {record.summary}
                          </p>
                        )}

                        <div className="flex items-center space-x-4">
                          {record.has_attachments && (
                            <span className="inline-flex items-center text-xs text-gray-500">
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              Has attachments
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 ml-4">
                        <div className="flex flex-col space-y-2">
                          <Link
                            href={`/dashboard/patient/health-records/${record.id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                          >
                            View Details
                          </Link>
                          {record.document_url && (
                            <button
                              onClick={() => handleDownload(record.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                            >
                              Download
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Request Records Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Request Health Records</h3>
              {/* Request form would go here */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle request submission
                    setShowRequestModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
