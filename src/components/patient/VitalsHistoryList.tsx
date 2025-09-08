// src/components/patient/VitalsHistoryList.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { usePatientVitals } from '@/hooks/patient/usePatientVitals';
import type { VitalSigns } from '@/types/patient.types';
import { Card } from '@/components/ui/card';
import {
  Heart,
  Activity,
  Thermometer,
  Scale,
  Droplets,
  AlertCircle,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronRight,
  FileText,
  Filter,
  Download,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface VitalsHistoryEntry extends VitalSigns {
  id: number;
  recorded_at: string;
}

interface VitalsHistoryListProps {
  limit?: number;
  showFilters?: boolean;
  compact?: boolean;
}

export function VitalsHistoryList({ 
  limit, 
  showFilters = true, 
  compact = false 
}: VitalsHistoryListProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState({
    dateRange: '30',
    vitalType: 'all'
  });

  // Use the established usePatientVitals hook
  const { 
    vitals, 
    loading, 
    error, 
    hasMore, 
    refetch,
    loadMore 
  } = usePatientVitals({
    limit: limit || 30,
    autoRefresh: false,
    dateRange: filters.dateRange !== 'all' ? {
      start: new Date(Date.now() - parseInt(filters.dateRange) * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    } : undefined
  });

  // Transform vitals to VitalsHistoryEntry format
  const vitalsHistory = useMemo(() => {
    return vitals.map((vital, index) => ({
      ...vital,
      id: vital.id || index + 1,
      recorded_at: vital.recorded_date
    } as VitalsHistoryEntry));
  }, [vitals]);

  // Filter by vital type if specified
  const filteredHistory = useMemo(() => {
    if (filters.vitalType === 'all') {
      return vitalsHistory;
    }
    
    return vitalsHistory.filter(vital => {
      switch (filters.vitalType) {
        case 'blood_pressure':
          return vital.blood_pressure_systolic || vital.blood_pressure_diastolic;
        case 'heart_rate':
          return vital.heart_rate;
        case 'temperature':
          return vital.temperature;
        case 'weight':
          return vital.weight;
        case 'oxygen_saturation':
          return vital.oxygen_saturation;
        default:
          return true;
      }
    });
  }, [vitalsHistory, filters.vitalType]);

  const toggleExpanded = (id: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getVitalIcon = (vitalType: string) => {
    switch (vitalType) {
      case 'blood_pressure':
        return Heart;
      case 'heart_rate':
        return Activity;
      case 'temperature':
        return Thermometer;
      case 'weight':
        return Scale;
      case 'oxygen_saturation':
        return Droplets;
      case 'respiratory_rate':
        return Activity;
      default:
        return Activity;
    }
  };

  const getVitalDisplayValue = (vital: VitalsHistoryEntry, vitalType: string) => {
    switch (vitalType) {
      case 'blood_pressure':
        return vital.blood_pressure_systolic && vital.blood_pressure_diastolic 
          ? `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic}` 
          : null;
      case 'heart_rate':
        return vital.heart_rate ? `${vital.heart_rate} bpm` : null;
      case 'temperature':
        return vital.temperature ? `${vital.temperature}°F` : null;
      case 'weight':
        return vital.weight ? `${vital.weight} lbs` : null;
      case 'oxygen_saturation':
        return vital.oxygen_saturation ? `${vital.oxygen_saturation}%` : null;
      case 'respiratory_rate':
        return vital.respiratory_rate ? `${vital.respiratory_rate}/min` : null;
      default:
        return null;
    }
  };

  const getVitalTrend = (current: VitalsHistoryEntry, vitalType: string, previous?: VitalsHistoryEntry) => {
    if (!previous) return null;

    let currentValue: number | undefined;
    let previousValue: number | undefined;

    switch (vitalType) {
      case 'blood_pressure':
        currentValue = current.blood_pressure_systolic;
        previousValue = previous.blood_pressure_systolic;
        break;
      case 'heart_rate':
        currentValue = current.heart_rate;
        previousValue = previous.heart_rate;
        break;
      case 'temperature':
        currentValue = current.temperature;
        previousValue = previous.temperature;
        break;
      case 'weight':
        currentValue = current.weight;
        previousValue = previous.weight;
        break;
      case 'oxygen_saturation':
        currentValue = current.oxygen_saturation;
        previousValue = previous.oxygen_saturation;
        break;
      case 'respiratory_rate':
        currentValue = current.respiratory_rate;
        previousValue = previous.respiratory_rate;
        break;
      default:
        return null;
    }

    if (currentValue === undefined || previousValue === undefined) return null;

    if (currentValue > previousValue) {
      return <TrendingUp className="h-3 w-3 text-red-500" />;
    } else if (currentValue < previousValue) {
      return <TrendingDown className="h-3 w-3 text-green-500" />;
    } else {
      return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading vitals history...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 mb-2">{error}</p>
          <button 
            onClick={() => refetch()}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Try again
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filter History
            </h3>
            <div className="flex space-x-4">
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="all">All time</option>
              </select>
              
              <select
                value={filters.vitalType}
                onChange={(e) => setFilters(prev => ({ ...prev, vitalType: e.target.value }))}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All vitals</option>
                <option value="blood_pressure">Blood Pressure</option>
                <option value="heart_rate">Heart Rate</option>
                <option value="temperature">Temperature</option>
                <option value="weight">Weight</option>
                <option value="oxygen_saturation">Oxygen Saturation</option>
              </select>

              <button
                onClick={() => refetch()}
                className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* History List */}
      <Card className="divide-y divide-gray-200">
        <div className="px-6 py-4 bg-gray-50">
          <h3 className="font-medium text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Vitals History
            {filteredHistory.length > 0 && (
              <span className="ml-2 text-sm text-gray-600">
                ({filteredHistory.length} entries)
              </span>
            )}
          </h3>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vitals recorded</h3>
            <p className="text-gray-600">
              {filters.vitalType !== 'all' 
                ? `No ${filters.vitalType.replace('_', ' ')} measurements found for the selected period.`
                : 'No vital signs have been recorded yet.'
              }
            </p>
          </div>
        ) : (
          filteredHistory.map((vital, index) => {
            const isExpanded = expandedItems.has(vital.id);
            const previousVital = filteredHistory[index + 1];
            const hasMultipleVitals = ['blood_pressure_systolic', 'heart_rate', 'temperature', 'weight', 'oxygen_saturation', 'respiratory_rate']
              .filter(field => vital[field as keyof VitalsHistoryEntry] !== undefined && vital[field as keyof VitalsHistoryEntry] !== null)
              .length > 1;

            return (
              <div key={vital.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDate(vital.recorded_at)}
                      </div>
                      {!compact && (
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(vital.recorded_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    {/* Quick preview of primary vitals */}
                    <div className="flex items-center space-x-6">
                      {getVitalDisplayValue(vital, 'blood_pressure') && (
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-1 text-red-500" />
                          <span className="text-sm font-medium">
                            {getVitalDisplayValue(vital, 'blood_pressure')}
                          </span>
                          {getVitalTrend(vital, 'blood_pressure', previousVital)}
                        </div>
                      )}
                      
                      {getVitalDisplayValue(vital, 'heart_rate') && (
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 mr-1 text-blue-500" />
                          <span className="text-sm font-medium">
                            {getVitalDisplayValue(vital, 'heart_rate')}
                          </span>
                          {getVitalTrend(vital, 'heart_rate', previousVital)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {hasMultipleVitals && (
                      <button
                        onClick={() => toggleExpanded(vital.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {isExpanded ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {(isExpanded || compact) && (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {['blood_pressure', 'heart_rate', 'temperature', 'weight', 'oxygen_saturation', 'respiratory_rate']
                        .map(vitalType => {
                          const value = getVitalDisplayValue(vital, vitalType);
                          if (!value) return null;
                          
                          const Icon = getVitalIcon(vitalType);
                          
                          return (
                            <div key={vitalType} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center">
                                  <Icon className="h-4 w-4 mr-1 text-gray-600" />
                                  <span className="text-sm font-medium text-gray-900 capitalize">
                                    {vitalType.replace('_', ' ')}
                                  </span>
                                </div>
                                {getVitalTrend(vital, vitalType, previousVital)}
                              </div>
                              <div className="text-lg font-bold text-gray-900">{value}</div>
                            </div>
                          );
                        })}
                    </div>

                    {vital.notes && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          <FileText className="h-4 w-4 mr-1 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Notes</span>
                        </div>
                        <p className="text-sm text-blue-800">{vital.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Load More Button */}
        {hasMore && !compact && (
          <div className="px-6 py-4 bg-gray-50 border-t">
            <button
              onClick={() => loadMore()}
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Load More History
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}