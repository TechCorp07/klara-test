// src/hooks/patient/usePatientHealthRecords.ts

import { useState, useEffect, useCallback } from 'react';
import { patientService } from '@/lib/api/services/patient.service';

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
  file_size?: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
}

interface HealthRecordsSummary {
  total_records: number;
  recent_records: number; // Last 30 days
  pending_results: number;
  critical_alerts: number;
  last_updated: string;
  records_by_type: Record<string, number>;
  records_by_provider: Record<string, number>;
}

interface HealthRecordFilters {
  record_type?: string;
  start_date?: string;
  end_date?: string;
  provider?: number;
  status?: string;
  is_critical?: boolean;
  has_attachments?: boolean;
  search_query?: string;
}

interface UsePatientHealthRecordsOptions {
  filters?: HealthRecordFilters;
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface RecordRequest {
  record_types: string[];
  date_range?: {
    start_date: string;
    end_date: string;
  };
  delivery_method: 'email' | 'mail' | 'pickup';
  purpose: string;
  notes?: string;
}

interface RecordRequestResponse {
  request_id: string;
  estimated_completion: string;
  tracking_number?: string;
  status: 'submitted' | 'processing' | 'ready' | 'delivered';
}

interface UsePatientHealthRecordsReturn {
  // Data
  records: HealthRecord[];
  summary: HealthRecordsSummary | null;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  
  // Actions
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  downloadRecord: (recordId: number) => Promise<void>;
  requestRecords: (requestData: RecordRequest) => Promise<RecordRequestResponse>;
  shareRecord: (recordId: number, recipientEmail: string, message?: string) => Promise<void>;
  
  // Filtering
  setFilters: (filters: HealthRecordFilters) => void;
  clearFilters: () => void;
  searchRecords: (query: string) => void;
  
  // Utilities
  getRecordsByType: (type: string) => HealthRecord[];
  getCriticalRecords: () => HealthRecord[];
  getRecentRecords: (days?: number) => HealthRecord[];
}

export const usePatientHealthRecords = (
  options: UsePatientHealthRecordsOptions = {}
): UsePatientHealthRecordsReturn => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [summary, setSummary] = useState<HealthRecordsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFiltersState] = useState<HealthRecordFilters>(options.filters || {});

  // Fetch health records
  const fetchHealthRecords = useCallback(async (append = false) => {
    try {
      if (!append) setLoading(true);
      setError(null);

      const params: Record<string, string | number | boolean | undefined> = {
        limit: options.limit || 20,
        offset: append ? records.length : 0,
        ordering: '-date',
      };

      // Apply filters
      if (filters.record_type) params.record_type = filters.record_type;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.provider) params.provider = filters.provider;
      if (filters.status) params.status = filters.status;
      if (filters.is_critical !== undefined) params.is_critical = filters.is_critical;
      if (filters.has_attachments !== undefined) params.has_attachments = filters.has_attachments;
      if (filters.search_query) params.search = filters.search_query;

      const response = await patientService.getHealthRecords(params);
      
      if (append) {
        setRecords(prev => [...prev, ...response.results]);
      } else {
        setRecords(response.results);
      }
      
      setHasMore(!!response.next);
      setTotalCount(response.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load health records');
    } finally {
      setLoading(false);
    }
  }, [filters, records.length, options.limit]);

  // Fetch summary data
  const fetchSummary = useCallback(async () => {
    try {
      // This would be a separate endpoint for summary data
      // For now, we'll calculate it from the records
      const summaryData: HealthRecordsSummary = {
        total_records: totalCount,
        recent_records: records.filter(record => {
          const recordDate = new Date(record.date);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return recordDate >= thirtyDaysAgo;
        }).length,
        pending_results: records.filter(record => record.status === 'pending').length,
        critical_alerts: records.filter(record => record.is_critical).length,
        last_updated: new Date().toISOString(),
        records_by_type: records.reduce((acc, record) => {
          acc[record.record_type] = (acc[record.record_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        records_by_provider: records.reduce((acc, record) => {
          acc[record.provider.name] = (acc[record.provider.name] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
      
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  }, [records, totalCount]);

    // Fetch summary when records change
    useEffect(() => {
      if (records.length > 0) {
        fetchSummary();
      }
    }, [fetchSummary, records.length]);

  // Initial fetch and when filters change
  useEffect(() => {
    fetchHealthRecords();
  }, [fetchHealthRecords]);

  // Auto-refresh functionality
  useEffect(() => {
    if (options.autoRefresh) {
      const interval = setInterval(
        () => fetchHealthRecords(),
        options.refreshInterval || 300000 // Default 5 minutes
      );
      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, options.refreshInterval, fetchHealthRecords]);

  // Load more records (pagination)
  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await fetchHealthRecords(true);
    }
  }, [hasMore, loading, fetchHealthRecords]);

  // Download record
  const downloadRecord = useCallback(async (recordId: number) => {
    try {
      const blob = await patientService.downloadLabResult(recordId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from record
      const record = records.find(r => r.id === recordId);
      const filename = record ? `${record.title.replace(/[^a-z0-9]/gi, '_')}.pdf` : `health_record_${recordId}.pdf`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to download record');
    }
  }, [records]);

  // Request records
  const requestRecords = useCallback(async (requestData: RecordRequest): Promise<RecordRequestResponse> => {
    try {
      const response = await patientService.requestHealthRecords(requestData);
      // Add the required status field to match RecordRequestResponse interface
      return {
        ...response,
        status: 'submitted' // Default status for new requests
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to submit record request');
    }
  }, []);

  // Share record (hypothetical feature)
  const shareRecord = useCallback(async (recordId: number, recipientEmail: string, message?: string) => {
    try {
      // This would be a separate API endpoint for sharing records
      await patientService.sendMessage({
        recipient: 0, // Would need to resolve email to user ID
        subject: 'Shared Health Record',
        message: message || 'A health record has been shared with you.',
        // attachments: [record file]
      });
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to share record');
    }
  }, []);

  // Filter management
  const setFilters = useCallback((newFilters: HealthRecordFilters) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);

  const searchRecords = useCallback((query: string) => {
    setFiltersState(prev => ({ ...prev, search_query: query }));
  }, []);

  // Utility functions
  const getRecordsByType = useCallback((type: string) => {
    return records.filter(record => record.record_type === type);
  }, [records]);

  const getCriticalRecords = useCallback(() => {
    return records.filter(record => record.is_critical);
  }, [records]);

  const getRecentRecords = useCallback((days = 30) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return records.filter(record => new Date(record.date) >= cutoffDate);
  }, [records]);

  // Refetch data
  const refetch = useCallback(async () => {
    await fetchHealthRecords();
  }, [fetchHealthRecords]);

  return {
    records,
    summary,
    loading,
    error,
    hasMore,
    totalCount,
    refetch,
    loadMore,
    downloadRecord,
    requestRecords,
    shareRecord,
    setFilters,
    clearFilters,
    searchRecords,
    getRecordsByType,
    getCriticalRecords,
    getRecentRecords,
  };
};

// Helper hook for critical records only
export const useCriticalHealthRecords = () => {
  return usePatientHealthRecords({
    filters: { is_critical: true },
    autoRefresh: true,
    refreshInterval: 60000, // 1 minute for critical records
  });
};

// Helper hook for recent lab results
export const useRecentLabResults = (days = 30) => {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return usePatientHealthRecords({
    filters: {
      record_type: 'lab_result',
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate,
    },
    autoRefresh: true,
  });
};

// Helper hook for pending results
export const usePendingResults = () => {
  return usePatientHealthRecords({
    filters: { status: 'pending' },
    autoRefresh: true,
    refreshInterval: 120000, // 2 minutes for pending results
  });
};

// Helper hook for records with attachments
export const useRecordsWithAttachments = () => {
  return usePatientHealthRecords({
    filters: { has_attachments: true },
  });
};
