// src/app/(dashboard)/patient/components/HealthRecordsAccess.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface HealthRecord {
  id: number;
  record_type: 'lab_result' | 'imaging' | 'visit_note' | 'test_result' | 'prescription' | 'vaccination';
  title: string;
  date: string;
  provider: {
    name: string;
    specialty: string;
  };
  status: 'final' | 'preliminary' | 'pending';
  has_attachments: boolean;
  is_critical: boolean;
  summary?: string;
}

interface RecordSummary {
  total_records: number;
  recent_records: number;
  pending_results: number;
  critical_alerts: number;
  last_updated: string;
}

export const HealthRecordsAccess: React.FC = () => {
  const [recentRecords, setRecentRecords] = useState<HealthRecord[]>([]);
  const [summary, setSummary] = useState<RecordSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthRecords = async () => {
      try {
        setLoading(true);
        
        // Fetch recent records (last 30 days)
        const recentResponse = await fetch('/api/healthcare/records/?limit=5&ordering=-date', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!recentResponse.ok) {
          throw new Error('Failed to fetch health records');
        }

        const recentData = await recentResponse.json();
        setRecentRecords(recentData.results || []);

        // Fetch summary data
        const summaryResponse = await fetch('/api/healthcare/records/summary/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        });

        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          setSummary(summaryData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Health records fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthRecords();
  }, []);

  // Get record type icon and color
  const getRecordTypeInfo = (type: string) => {
    switch (type) {
      case 'lab_result':
        return {
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: 'text-green-600 bg-green-100',
          label: 'Lab Result'
        };
      case 'imaging':
        return {
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          color: 'text-blue-600 bg-blue-100',
          label: 'Imaging'
        };
      case 'visit_note':
        return {
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          color: 'text-purple-600 bg-purple-100',
          label: 'Visit Note'
        };
      case 'prescription':
        return {
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          ),
          color: 'text-indigo-600 bg-indigo-100',
          label: 'Prescription'
        };
      case 'vaccination':
        return {
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ),
          color: 'text-pink-600 bg-pink-100',
          label: 'Vaccination'
        };
      default:
        return {
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          color: 'text-gray-600 bg-gray-100',
          label: 'Medical Record'
        };
    }
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
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Health Records</h3>
          <Link
            href="/dashboard/patient/health-records"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All Records
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">Failed to load health records</div>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            {summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">{summary.total_records}</div>
                  <div className="text-xs text-gray-600">Total Records</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">{summary.recent_records}</div>
                  <div className="text-xs text-blue-700">Recent (30 days)</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-lg font-semibold text-yellow-600">{summary.pending_results}</div>
                  <div className="text-xs text-yellow-700">Pending Results</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-lg font-semibold text-red-600">{summary.critical_alerts}</div>
                  <div className="text-xs text-red-700">Critical Alerts</div>
                </div>
              </div>
            )}

            {/* Critical Alerts */}
            {summary && summary.critical_alerts > 0 && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium text-red-800">Critical Results Available</p>
                    <p className="text-sm text-red-700">
                      You have {summary.critical_alerts} critical test result(s) that require attention.
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/patient/health-records?filter=critical"
                  className="mt-3 inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                >
                  View Critical Results
                </Link>
              </div>
            )}

            {/* Recent Records */}
            {recentRecords.length === 0 ? (
              <div className="text-center py-8">
                <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 mb-4">No recent health records</p>
                <p className="text-sm text-gray-400">
                  Your medical records and test results will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-900 mb-3">Recent Records</h4>
                {recentRecords.map((record) => {
                  const typeInfo = getRecordTypeInfo(record.record_type);
                  
                  return (
                    <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`flex-shrink-0 p-2 rounded-lg ${typeInfo.color}`}>
                            {typeInfo.icon}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="text-sm font-medium text-gray-900 truncate">
                                {record.title}
                              </h5>
                              {record.is_critical && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Critical
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-1">
                              {record.provider.name} - {record.provider.specialty}
                            </p>
                            
                            {record.summary && (
                              <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                                {record.summary}
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{new Date(record.date).toLocaleDateString()}</span>
                              <span className="capitalize">{typeInfo.label}</span>
                              {record.has_attachments && (
                                <span className="flex items-center">
                                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                  Attachments
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2 ml-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}
                          >
                            {record.status}
                          </span>
                          
                          <Link
                            href={`/dashboard/patient/health-records/${record.id}`}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/dashboard/patient/health-records?filter=lab_results"
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-shrink-0 text-green-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">Lab Results</p>
                    <p className="text-xs text-gray-500">View test results</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/patient/health-records?action=request"
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-shrink-0 text-blue-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">Request Records</p>
                    <p className="text-xs text-gray-500">Get copies or amendments</p>
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>All health information is HIPAA protected</span>
          {summary?.last_updated && (
            <span>Last updated: {new Date(summary.last_updated).toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};
