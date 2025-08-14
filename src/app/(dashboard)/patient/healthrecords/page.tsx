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
  Plus,
  Eye,
  Share2,
  Upload,
  RefreshCw,
  ArrowLeft,
  Loader2,
  ChevronDown
} from 'lucide-react';

type RecordType = 'all' | 'conditions' | 'medications' | 'lab_results' | 'vital_signs' | 'allergies' | 'family_history' | 'immunizations';

export default function HealthRecordsPage() {
  const router = useRouter();
  const { user, getUserRole } = useAuth();
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
    records,
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
      start_date: newFilters.dateRange ? 
        new Date(Date.now() - parseInt(newFilters.dateRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
        undefined,
      search_query: searchQuery || undefined
    };
    
    setFilters(apiFilters);
  };

  const handleDownload = async (recordId: number) => {
    try {
      await downloadRecord(recordId);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const clearAllFilters = () => {
    setSelectedFilters({ status: '', provider: '', dateRange: '', critical: false });
    setSearchQuery('');
    clearFilters();
  };

  // Tab configuration
  const tabs = [
    { id: 'all', label: 'All Records', icon: FileText, count: summary?.total_records || 0 },
    { id: 'conditions', label: 'Conditions', icon: Heart, count: summary?.records_by_type?.condition || 0 },
    { id: 'medications', label: 'Medications', icon: Pill, count: summary?.records_by_type?.medication || 0 },
    { id: 'lab_results', label: 'Lab Results', icon: FlaskConical, count: summary?.records_by_type?.lab_result || 0 },
    { id: 'vital_signs', label: 'Vital Signs', icon: Activity, count: summary?.records_by_type?.vital_sign || 0 },
    { id: 'allergies', label: 'Allergies', icon: Shield, count: summary?.records_by_type?.allergy || 0 },
    { id: 'family_history', label: 'Family History', icon: Users, count: summary?.records_by_type?.family_history || 0 },
    { id: 'immunizations', label: 'Immunizations', icon: Shield, count: summary?.records_by_type?.immunization || 0 }
  ];

  // Get filtered records based on active tab
  const getFilteredRecords = () => {
    if (activeTab === 'all') return records;
    return getRecordsByType(activeTab);
  };

  const filteredRecords = getFilteredRecords();

  if (loading && records.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading your health records...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Card className="p-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Health Records</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => refetch()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <button
              onClick={() => router.push('/patient')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Health Records</h1>
              <p className="text-gray-600 mt-1">
                Complete medical history and health information
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Upload className="w-4 h-4 mr-2" />
              Upload Records
            </button>
            
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{summary.total_records}</div>
                  <div className="text-sm text-gray-600">Total Records</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{summary.recent_records}</div>
                  <div className="text-sm text-gray-600">Recent (30d)</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center">
                <FlaskConical className="w-8 h-8 text-orange-500 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{summary.pending_results}</div>
                  <div className="text-sm text-gray-600">Pending Results</div>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center">
                <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{summary.critical_alerts}</div>
                  <div className="text-sm text-gray-600">Critical Alerts</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Critical Alerts Banner */}
        {summary?.critical_alerts && summary.critical_alerts > 0 && (
          <Card className="p-4 mb-6 bg-red-50 border-red-200">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Critical Health Alerts ({summary.critical_alerts})
                </h3>
                <p className="text-sm text-red-700">
                  You have critical health records that require immediate attention.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search health records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                showFilters || Object.values(selectedFilters).some(v => v)
                  ? 'border-blue-500 text-blue-700 bg-blue-50' 
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {Object.values(selectedFilters).some(v => v) && (
                <span className="ml-1 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {Object.values(selectedFilters).filter(v => v).length}
                </span>
              )}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedFilters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="final">Final</option>
                    <option value="preliminary">Preliminary</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <select
                    value={selectedFilters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Time</option>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 3 Months</option>
                    <option value="365">Last Year</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Critical Only</label>
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={selectedFilters.critical}
                      onChange={(e) => handleFilterChange('critical', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Show only critical records</span>
                  </label>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as RecordType)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Records List */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || Object.values(selectedFilters).some(v => v) 
                  ? 'No Records Found' 
                  : 'No Health Records'
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || Object.values(selectedFilters).some(v => v)
                  ? 'Try adjusting your search or filters to find what you\'re looking for.'
                  : 'Your health records will appear here as they become available.'
                }
              </p>
              {(searchQuery || Object.values(selectedFilters).some(v => v)) && (
                <button
                  onClick={clearAllFilters}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear search and filters
                </button>
              )}
            </Card>
          ) : (
            <>
              {filteredRecords.map((record) => (
                <Card key={record.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
                        
                        {record.is_critical && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Critical
                          </span>
                        )}
                        
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'final' ? 'bg-green-100 text-green-800' :
                          record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          record.status === 'preliminary' ? 'bg-blue-100 text-blue-800' :
                          record.status === 'amended' ? 'bg-orange-100 text-orange-800' :
                          record.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          Type: {record.record_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Date: {new Date(record.date).toLocaleDateString()}
                        </div>
                        
                        {record.provider && (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            {record.provider.name}
                          </div>
                        )}
                      </div>

                      {record.summary && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{record.summary}</p>
                      )}

                      <div className="flex items-center text-xs text-gray-500">
                        <span>Created: {new Date(record.created_at).toLocaleDateString()}</span>
                        {record.has_attachments && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="flex items-center">
                              <FileText className="w-3 h-3 mr-1" />
                              Has attachments
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
                      
                      <button
                        onClick={() => handleDownload(record.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded"
                        title="Download record"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded" title="Share record">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center py-6">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ChevronDown className="w-4 h-4 mr-2" />
                    )}
                    Load More Records ({totalCount - filteredRecords.length} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}