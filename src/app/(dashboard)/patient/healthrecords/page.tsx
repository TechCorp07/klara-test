// src/app/(dashboard)/patient/healthrecords/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { usePatientHealthRecords } from '@/hooks/patient/usePatientHealthRecords';
import { Card } from '@/components/ui/card';
import {
  FileText, 
  Download, 
  Search, 
  Filter, 
  Calendar,
  AlertCircle,
  Heart,
  Activity,
  Pill,
  FlaskConical,
  Shield,
  Users,
  Eye,
  Upload,
  RefreshCw,
  Loader2,
  ChevronDown
} from 'lucide-react';

type RecordType = 'all' | 'conditions' | 'medications' | 'lab_results' | 'vital_signs' | 'allergies' | 'family_history' | 'immunizations';

export default function HealthRecordsPage() {
  const router = useRouter();
  const { user, getUserRole } = useAuth();
  
  // Error boundary states
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [activeTab, setActiveTab] = useState<RecordType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    status: '',
    provider: '',
    dateRange: '',
    critical: false
  });

  const {
    summary,
    loading,
    error,
    hasMore,
    totalCount,
    refetch,
    loadMore,
    downloadRecord,
    searchRecords,
    setFilters,
    clearFilters,
    getRecordsByType
  } = usePatientHealthRecords({
    autoRefresh: true,
    refreshInterval: 30000,
    limit: 20
  });

  // Role validation
  const userRole = getUserRole();
  useEffect(() => {
    if (userRole && userRole !== 'patient') {
      router.push(`/${userRole}`);
      return;
    }
  }, [userRole, router]);

  // Error boundary reset effect
  useEffect(() => {
    setHasError(false);
    setErrorMessage('');
  }, []);

  // Error handling for hook errors
  useEffect(() => {
    if (error) {
      setHasError(true);
      setErrorMessage(error);
    }
  }, [error]);

  // Error boundary render
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              {errorMessage || 'We encountered an error loading your health records.'}
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => {
                  setHasError(false);
                  setErrorMessage('');
                  refetch();
                }} 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Reload Page
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Helper function to get record status safely
  const getRecordStatus = (record: any): string => {
    if (!record || !record.status) {
      return 'active'; // Default status
    }
    return record.status;
  };

  // Search debounce
  useEffect(() => {
    if (searchQuery) {
      const debounceTimer = setTimeout(() => {
        searchRecords(searchQuery);
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, searchRecords]);

  // Filter application
  const handleFilterChange = (filterKey: string, value: string | boolean) => {
    const newFilters = { ...selectedFilters, [filterKey]: value };
    setSelectedFilters(newFilters);
    
    // Convert to API format
    const apiFilters = {
      status: newFilters.status || undefined,
      is_critical: newFilters.critical || undefined,
      start_date: newFilters.dateRange ? new Date(newFilters.dateRange).toISOString().split('T')[0] : undefined,
      end_date: newFilters.dateRange ? new Date().toISOString().split('T')[0] : undefined,
    };
    
    setFilters(apiFilters);
  };

  // Record tabs configuration
  const recordTabs = [
    { key: 'all', label: 'All Records', icon: FileText },
    { key: 'conditions', label: 'Conditions', icon: Heart },
    { key: 'medications', label: 'Medications', icon: Pill },
    { key: 'lab_results', label: 'Lab Results', icon: FlaskConical },
    { key: 'vital_signs', label: 'Vital Signs', icon: Activity },
    { key: 'allergies', label: 'Allergies', icon: Shield },
    { key: 'family_history', label: 'Family History', icon: Users },
    { key: 'immunizations', label: 'Immunizations', icon: Shield },
  ];

  // Get record type counts
  const getRecordCount = (type: RecordType) => {
    if (type === 'all') return totalCount || 0;
    return summary?.records_by_type?.[type] || 0;
  };

  // Render records function with error handling
  const renderRecords = () => {
    try {
      const filteredRecords = getRecordsByType(activeTab);
      
      if (!filteredRecords || filteredRecords.length === 0) {
        return (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No health records found</h3>
            <p className="text-gray-600">
              {activeTab === 'all' 
                ? "You don't have any health records yet." 
                : `No ${activeTab.replace('_', ' ')} records found.`}
            </p>
          </Card>
        );
      }

      return (
        <div className="space-y-4">
          {filteredRecords.map((record: any) => (
            <Card key={record.id || Math.random()} className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {record.title || record.name || 'Untitled Record'}
                    </h3>
                    
                    {record.is_critical && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Critical
                      </span>
                    )}
                    
                    {record.is_rare_condition && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Rare Condition
                      </span>
                    )}
                    
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      getRecordStatus(record) === 'active' ? 'bg-green-100 text-green-800' :
                      getRecordStatus(record) === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      getRecordStatus(record) === 'preliminary' ? 'bg-blue-100 text-blue-800' :
                      getRecordStatus(record) === 'amended' ? 'bg-orange-100 text-orange-800' :
                      getRecordStatus(record) === 'cancelled' ? 'bg-red-100 text-red-800' :
                      getRecordStatus(record) === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getRecordStatus(record).charAt(0).toUpperCase() + getRecordStatus(record).slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Type: {(record.record_type || record.type || 'unknown').replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Date: {record.date || record.created_at ? new Date(record.date || record.created_at).toLocaleDateString() : 'No date'}
                    </div>
                    
                    {(record.provider || record.provider_name) && (
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        {record.provider?.name || record.provider_name || 'Unknown Provider'}
                      </div>
                    )}
                  </div>

                  {(record.summary || record.description) && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {record.summary || record.description}
                    </p>
                  )}

                  <div className="flex items-center text-xs text-gray-500">
                    <span>
                      Created: {record.created_at ? new Date(record.created_at).toLocaleDateString() : 'Unknown'}
                    </span>
                    {record.has_attachments && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="flex items-center">
                          <FileText className="w-3 h-3 mr-1" />
                          Has attachments
                        </span>
                      </>
                    )}
                    {record.is_urgent && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="flex items-center text-red-600">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Urgent
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => router.push(`/patient/healthrecords/${record.id}`)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {downloadRecord && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadRecord(record.id);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded"
                      title="Download record"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          
          {/* Load more button */}
          {hasMore && (
            <div className="text-center py-4">
              <button
                onClick={loadMore}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Load More Records
              </button>
            </div>
          )}
        </div>
      );
    } catch (err) {
      console.error('Error rendering records:', err);
      setHasError(true);
      setErrorMessage('Failed to display health records');
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Health Records</h1>
            <p className="text-gray-600 mt-1">
              View and manage your complete medical history
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload Record
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total_records || 0}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recent</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.recent_records || 0}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.pending_results || 0}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Critical</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.critical_alerts || 0}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search health records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2 border rounded-lg ${
                showFilters ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedFilters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <input
                    type="date"
                    value={selectedFilters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                  <input
                    type="text"
                    placeholder="Provider name"
                    value={selectedFilters.provider}
                    onChange={(e) => handleFilterChange('provider', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedFilters.critical}
                      onChange={(e) => handleFilterChange('critical', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Critical only</span>
                  </label>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Record Type Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {recordTabs.map((tab) => {
                const Icon = tab.icon;
                const count = getRecordCount(tab.key as RecordType);
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as RecordType)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                    {count > 0 && (
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        activeTab === tab.key
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Records List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex items-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
              <span className="text-gray-600">Loading health records...</span>
            </div>
          </div>
        ) : (
          renderRecords()
        )}
      </div>
    </div>
  );
}