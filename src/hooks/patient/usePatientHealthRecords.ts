// src/hooks/patient/usePatientHealthRecords.ts

import { useState, useEffect, useCallback } from 'react';
import { patientService } from '@/lib/api/services/patient.service';

// Import all required types from your health-records.types.ts
import type {
  HealthRecord,
  MedicalCondition,
  Medication,
  LabResult,
  VitalSign,
  Allergy,
  FamilyHistory,
  HealthRecordsSummary,
  HealthRecordFilters,
  UsePatientHealthRecordsOptions,
  UsePatientHealthRecordsReturn
} from '@/types/health-records.types';

// Local interfaces for record requests to match your patient service
interface RecordRequest {
  record_types: string[];
  date_range?: {
    start_date: string;
    end_date: string;
  };
  delivery_method: 'email' | 'mail' | 'pickup'; // Remove 'portal' to match service
  purpose: string;
  notes?: string;
}

interface RecordRequestResponse {
  request_id: string;
  estimated_completion: string;
  tracking_number?: string;
  status: 'submitted' | 'processing' | 'ready' | 'delivered'; // Add required status field
}

export function usePatientHealthRecords(
  options: UsePatientHealthRecordsOptions = {}
): UsePatientHealthRecordsReturn {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [conditions, setConditions] = useState<MedicalCondition[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [familyHistory, setFamilyHistory] = useState<FamilyHistory[]>([]);
  const [summary, setSummary] = useState<HealthRecordsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<HealthRecordFilters>(options.filters || {});
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch health records from API
  const fetchHealthRecords = useCallback(async (params: Record<string, string | number | boolean> = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Combine filters with search query
      const queryParams = {
        ...currentFilters,
        search: searchQuery,
        limit: options.limit || 20,
        ...params
      };

      const response = await patientService.getHealthRecords(queryParams);
      
      if (params.offset && typeof params.offset === 'number' && params.offset > 0) {
        // Append to existing records for pagination
        setRecords(prev => [...(prev || []), ...(response.results || [])]);
      } else {
        // Replace records for new search/filters
        setRecords(response.results || []);
      }
      
      setTotalCount(response.count || 0);
      setHasMore(!!response.next);
      
    } catch (err) {
      console.error('Failed to fetch health records:', err);
      setError(err instanceof Error ? err.message : 'Failed to load health records');
      // Set empty arrays on error to prevent undefined access
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [currentFilters, searchQuery, options.limit]);

  // Fetch medical conditions specifically
  const fetchMedicalConditions = useCallback(async () => {
    try {
      const response = await patientService.getMedicalConditions();
      setConditions(response.results || []);
    } catch (err) {
      console.error('Failed to fetch medical conditions:', err);
      setConditions([]);
    }
  }, []);

  // Fetch medications
  const fetchMedications = useCallback(async () => {
    try {
      // Use HealthRecord type for now since we don't have specific medication endpoint
      const response = await patientService.getHealthRecords({ record_type: 'medication' });
      // Convert HealthRecord[] to Medication[] - you may need to adjust this mapping
      setMedications(response.results as unknown as Medication[]);
    } catch (err) {
      console.error('Failed to fetch medications:', err);
      setMedications([]);
    }
  }, []);

  // Fetch lab results
  const fetchLabResults = useCallback(async () => {
    try {
      const response = await patientService.getHealthRecords({ record_type: 'lab_result' });
      setLabResults(response.results as unknown as LabResult[]);
    } catch (err) {
      console.error('Failed to fetch lab results:', err);
      setLabResults([]);
    }
  }, []);

  // Fetch vital signs
  const fetchVitalSigns = useCallback(async () => {
    try {
      const response = await patientService.getHealthRecords({ record_type: 'vital_sign' });
      setVitalSigns(response.results as unknown as VitalSign[]);
    } catch (err) {
      console.error('Failed to fetch vital signs:', err);
      setVitalSigns([]);
    }
  }, []);

  // Fetch allergies
  const fetchAllergies = useCallback(async () => {
    try {
      const response = await patientService.getHealthRecords({ record_type: 'allergy' });
      setAllergies(response.results as unknown as Allergy[]);
    } catch (err) {
      console.error('Failed to fetch allergies:', err);
      setAllergies([]);
    }
  }, []);

  // Fetch family history
  const fetchFamilyHistory = useCallback(async () => {
    try {
      const response = await patientService.getHealthRecords({ record_type: 'family_history' });
      setFamilyHistory(response.results as unknown as FamilyHistory[]);
    } catch (err) {
      console.error('Failed to fetch family history:', err);
      setFamilyHistory([]);
    }
  }, []);

  // Fetch summary data
  const fetchSummary = useCallback(async () => {
    try {
      const summaryData = await patientService.getHealthRecordsSummary();
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to fetch health records summary:', err);
      setSummary(null);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        fetchHealthRecords().catch(() => {
          // Already handled in fetchHealthRecords
        }),
        fetchMedicalConditions().catch(() => {
          // Already handled in fetchMedicalConditions  
        }),
        fetchSummary().catch(() => {
          // Already handled in fetchSummary
        })
      ]);
    };
    
    loadInitialData();
  }, [fetchHealthRecords, fetchMedicalConditions, fetchSummary]);

  // Auto-refresh functionality
  useEffect(() => {
    if (options.autoRefresh && options.refreshInterval) {
      const interval = setInterval(() => {
        fetchHealthRecords().catch(() => {
          // Already handled in fetchHealthRecords
        });
        fetchSummary().catch(() => {
          // Already handled in fetchSummary
        });
      }, options.refreshInterval);

      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, options.refreshInterval, fetchHealthRecords, fetchSummary]);

  // Refetch all data
  const refetch = useCallback(async () => {
    await Promise.all([
      fetchHealthRecords().catch(() => {
        // Already handled in fetchHealthRecords
      }),
      fetchMedicalConditions().catch(() => {
        // Already handled in fetchMedicalConditions
      }),
      fetchSummary().catch(() => {
        // Already handled in fetchSummary
      })
    ]);
  }, [fetchHealthRecords, fetchMedicalConditions, fetchSummary]);

  // Load more records (pagination)
  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      await fetchHealthRecords({ offset: (records || []).length }).catch(() => {
        // Already handled in fetchHealthRecords
      });
    }
  }, [hasMore, loading, records, fetchHealthRecords]);

  // Download a specific record
  const downloadRecord = useCallback(async (recordId: number) => {
    try {
      const blob = await patientService.downloadLabResult(recordId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `health-record-${recordId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Download failed:', err);
      throw new Error('Failed to download record');
    }
  }, []);

  // Request records from external providers
  const requestRecords = useCallback(async (requestData: RecordRequest): Promise<RecordRequestResponse> => {
    try {
      // Cast to the service's expected type and add missing status field
      const response = await patientService.requestHealthRecords(requestData as any);
      return {
        ...response,
        status: 'submitted' as const // Add the required status field
      };
    } catch (err) {
      console.error('Failed to request records:', err);
      throw new Error('Failed to submit record request');
    }
  }, []);

  // Share a record
  const shareRecord = useCallback(async (recordId: number, recipientEmail: string, message?: string) => {
    try {
      await patientService.sendMessage({
        recipient: 0, // This would need to be looked up based on email
        subject: `Shared Health Record #${recordId}`,
        message: message || 'A health record has been shared with you.',
        attachments: [recordId.toString()]
      });
    } catch (err) {
      console.error('Failed to share record:', err);
      throw new Error('Failed to share record');
    }
  }, []);

  // Update filters
  const setFilters = useCallback((filters: HealthRecordFilters) => {
    setCurrentFilters(filters);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setCurrentFilters({});
    setSearchQuery('');
  }, []);

  // Search records
  const searchRecords = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Utility functions with safe array access
  const getRecordsByType = useCallback((type: string): HealthRecord[] => {
    return (records || []).filter(record => record.record_type === type);
  }, [records]);

  const getCriticalRecords = useCallback((): HealthRecord[] => {
    return (records || []).filter(record => record.is_critical);
  }, [records]);

  const getRecentRecords = useCallback((days: number = 30): HealthRecord[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return (records || []).filter(record => 
      new Date(record.date) >= cutoffDate
    );
  }, [records]);

  return {
    // Data - with safe defaults
    records: records || [],
    conditions: conditions || [],
    medications: medications || [],
    labResults: labResults || [],
    vitalSigns: vitalSigns || [],
    allergies: allergies || [],
    familyHistory: familyHistory || [],
    summary,
    loading,
    error,
    hasMore,
    totalCount,
    
    // Actions
    refetch,
    loadMore,
    downloadRecord,
    requestRecords,
    shareRecord,
    
    // Filtering
    setFilters,
    clearFilters,
    searchRecords,
    
    // Utilities
    getRecordsByType,
    getCriticalRecords,
    getRecentRecords
  };
}