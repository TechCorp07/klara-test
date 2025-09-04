// src/components/patient/VitalsHistoryList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { patientService } from '@/lib/api/services/patient.service';
import { VitalSignsEntry } from '@/lib/api/services/patient.service';
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
  Download
} from 'lucide-react';

interface VitalsHistoryEntry extends VitalSignsEntry {
  id: number;
  recorded_at: string;
  created_at: string;
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
  const [vitalsHistory, setVitalsHistory] = useState<VitalsHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState({
    dateRange: '30',
    vitalType: 'all'
  });

  useEffect(() => {
    fetchVitalsHistory();
  }, [filters, limit]);

  const fetchVitalsHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This would use your existing API endpoint
      // For now, using a mock structure - replace with actual API call
      const response = await fetch('/api/patient/vitals/history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch vitals history');
      }
      
      const data = await response.json();
      let history = data.results || [];
      
      if (limit) {
        history = history.slice(0, limit);
      }
      
      setVitalsHistory(history);
    } catch (err) {
      console.error('Failed to fetch vitals history:', err);
      setError('Failed to load vitals history');
      
      // For development - mock data
      const mockData: VitalsHistoryEntry[] = [
        {
          id: 1,
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          heart_rate: 72,
          temperature: 98.6,
          weight: 165,
          oxygen_saturation: 98,
          pain_level: 2,
          notes: "Feeling good today, slight headache",
          recorded_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
        },
        {
          id: 2,
          blood_pressure_systolic: 118,
          blood_pressure_diastolic: 78,
          heart_rate: 68,
          temperature: 98.4,
          weight: 164,
          oxygen_saturation: 99,
          pain_level: 1,
          notes: "Post-exercise vitals",
          recorded_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
        }
      ];
      setVitalsHistory(mockData);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getVitalIcon = (type: string) => {
    switch (type) {
      case 'blood_pressure': return Heart;
      case 'heart_rate': return Activity;
      case 'temperature': return Thermometer;
      case 'weight': return Scale;
      case 'oxygen_saturation': return Droplets;
      case 'pain_level': return AlertCircle;
      default: return Activity;
    }
  };

  const getTrendIndicator = (current: number, previous?: number) => {
    if (!previous) return null;
    
    const diff = current - previous;
    if (Math.abs(diff) < 0.1) {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
    
    return diff > 0 ? 
      <TrendingUp className="h-4 w-4 text-red-500" /> : 
      <TrendingDown className="h-4 w-4 text-green-500" />;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getVitalDisplayValue = (vital: VitalsHistoryEntry, type: string) => {
    switch (type) {
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
      case 'pain_level':
        return vital.pain_level !== undefined ? `${vital.pain_level}/10` : null;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            onClick={fetchVitalsHistory}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
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
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="all">All time</option>
              </select>
              
              <select
                value={filters.vitalType}
                onChange={(e) => setFilters(prev => ({ ...prev, vitalType: e.target.value }))}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="all">All vitals</option>
                <option value="blood_pressure">Blood Pressure</option>
                <option value="heart_rate">Heart Rate</option>
                <option value="temperature">Temperature</option>
                <option value="weight">Weight</option>
              </select>
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
            {vitalsHistory.length > 0 && (
              <span className="ml-2 text-sm text-gray-600">
                ({vitalsHistory.length} entries)
              </span>
            )}
          </h3>
        </div>

        {vitalsHistory.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Activity className="h-8 w-8 mx-auto mb-3 text-gray-400" />
            <p>No vital signs recorded yet</p>
            <p className="text-sm">Start recording your vitals to track your health</p>
          </div>
        ) : (
          vitalsHistory.map((vital, index) => {
            const isExpanded = expandedItems.has(vital.id);
            const { date, time } = formatDateTime(vital.recorded_at);
            const previousVital = index < vitalsHistory.length - 1 ? vitalsHistory[index + 1] : undefined;
            
            return (
              <div key={vital.id} className="p-4">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => !compact && toggleExpanded(vital.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{date}</span>
                      <Clock className="h-4 w-4 ml-3 mr-1" />
                      <span>{time}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Quick vital display */}
                    <div className="flex space-x-4 text-sm">
                      {vital.blood_pressure_systolic && vital.blood_pressure_diastolic && (
                        <span className="flex items-center">
                          <Heart className="h-3 w-3 mr-1 text-red-500" />
                          {vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic}
                        </span>
                      )}
                      {vital.heart_rate && (
                        <span className="flex items-center">
                          <Activity className="h-3 w-3 mr-1 text-blue-500" />
                          {vital.heart_rate}
                        </span>
                      )}
                      {vital.temperature && (
                        <span className="flex items-center">
                          <Thermometer className="h-3 w-3 mr-1 text-orange-500" />
                          {vital.temperature}°F
                        </span>
                      )}
                    </div>
                    
                    {!compact && (
                      <button className="text-gray-400 hover:text-gray-600">
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
                      {['blood_pressure', 'heart_rate', 'temperature', 'weight', 'oxygen_saturation', 'pain_level']
                        .map(vitalType => {
                          const value = getVitalDisplayValue(vital, vitalType);
                          if (!value) return null;
                          
                          const Icon = getVitalIcon(vitalType);
                          const prevValue = previousVital ? getVitalDisplayValue(previousVital, vitalType) : null;
                          
                          return (
                            <div key={vitalType} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center">
                                  <Icon className="h-4 w-4 mr-1 text-gray-600" />
                                  <span className="text-sm font-medium text-gray-900 capitalize">
                                    {vitalType.replace('_', ' ')}
                                  </span>
                                </div>
                                {/* Trend indicator would go here if needed */}
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
      </Card>
    </div>
  );
}