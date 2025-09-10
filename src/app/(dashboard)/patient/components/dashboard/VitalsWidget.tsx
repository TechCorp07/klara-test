// src/app/(dashboard)/patient/components/dashboard/VitalsWidget.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  Thermometer, 
  Scale, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ChevronDown, 
  ChevronRight,
  Clock,
  Plus,
  Loader2
} from 'lucide-react';
import { usePatientVitals } from '@/hooks/patient/usePatientVitals';
import type { VitalSigns } from '@/types/patient.types';

interface VitalsWidgetProps {
  onRecordVitals?: () => void;
}

export function VitalsWidget({ onRecordVitals }: VitalsWidgetProps) {
  const router = useRouter();
  const [expandedRecording, setExpandedRecording] = useState<number | null>(null);
  
  // Use the same pattern as AppointmentsWidget - fetch data directly
  const { 
    vitals, 
    loading, 
    error,
    trends 
  } = usePatientVitals({
    limit: 10,
    autoRefresh: true,
    refreshInterval: 60000 // 1 minute refresh
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Less than an hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatBloodPressure = (systolic?: number, diastolic?: number) => {
    if (systolic && diastolic) return `${systolic}/${diastolic}`;
    if (systolic) return `${systolic}/-`;
    if (diastolic) return `-/${diastolic}`;
    return null;
  };

  const getRecordingSummary = (reading: VitalSigns) => {
    const measurements: string[] = [];
    
    if (reading.blood_pressure_systolic || reading.blood_pressure_diastolic) {
      const bp = formatBloodPressure(reading.blood_pressure_systolic, reading.blood_pressure_diastolic);
      if (bp) measurements.push(`BP: ${bp}`);
    }
    if (reading.heart_rate) measurements.push(`HR: ${reading.heart_rate}`);
    if (reading.temperature) measurements.push(`Temp: ${reading.temperature}°F`);
    if (reading.weight) measurements.push(`Weight: ${reading.weight}lbs`);
    if (reading.oxygen_saturation) measurements.push(`O2: ${reading.oxygen_saturation}%`);
    
    return measurements.slice(0, 3).join(' • ');
  };

  const toggleExpanded = (recordingId: number) => {
    setExpandedRecording(expandedRecording === recordingId ? null : recordingId);
  };

  const getTrendIcon = (vitalType: keyof VitalSigns) => {
    const trend = trends.find(t => t.vital_type === vitalType);
    if (!trend) return Minus;
    
    switch (trend.trend) {
      case 'increasing': return TrendingUp;
      case 'decreasing': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = (vitalType: keyof VitalSigns) => {
    const trend = trends.find(t => t.vital_type === vitalType);
    if (!trend) return 'text-gray-600';
    
    // For most vitals, increasing might be concerning, but this depends on context
    switch (trend.trend) {
      case 'increasing': return 'text-amber-600';
      case 'decreasing': return 'text-blue-600';  
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Activity className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Activity className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
          </div>
        </div>
        <div className="text-center py-4 text-red-500">
          <p className="text-sm">Failed to load vitals</p>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const hasVitals = vitals.length > 0;
  const recentVitals = vitals.slice(0, 5); // Show last 5 recordings

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Activity className="w-5 h-5 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
        </div>
        <button
          onClick={onRecordVitals || (() => router.push('/patient/vitals/record'))}
          className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" />
          Record
        </button>
      </div>

      {hasVitals ? (
        <>
          {/* Recent Recordings List */}
          <div className="space-y-3 mb-4">
            <h4 className="font-medium text-gray-900 text-sm">
              Recent Recordings ({vitals.length})
            </h4>
            {recentVitals.map((reading) => (
              <div key={reading.id || reading.recorded_date} className="border border-gray-200 rounded-lg">
                <div 
                  className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpanded(reading.id as number || 0)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(reading.recorded_date)}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {getRecordingSummary(reading) || 'Notes only'}
                      </div>
                    </div>
                    <div className="ml-2">
                      {expandedRecording === (reading.id as number || 0) ? 
                        <ChevronDown className="w-4 h-4 text-gray-400" /> : 
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      }
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRecording === (reading.id as number || 0) && (
                  <div className="px-3 pb-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                      {reading.blood_pressure_systolic && reading.blood_pressure_diastolic && (
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 text-red-500 mr-2" />
                          <span>Blood Pressure: {reading.blood_pressure_systolic}/{reading.blood_pressure_diastolic}</span>
                        </div>
                      )}
                      {reading.heart_rate && (
                        <div className="flex items-center">
                          <Activity className="w-4 h-4 text-blue-500 mr-2" />
                          <span>Heart Rate: {reading.heart_rate} bpm</span>
                        </div>
                      )}
                      {reading.temperature && (
                        <div className="flex items-center">
                          <Thermometer className="w-4 h-4 text-orange-500 mr-2" />
                          <span>Temperature: {reading.temperature}°F</span>
                        </div>
                      )}
                      {reading.weight && (
                        <div className="flex items-center">
                          <Scale className="w-4 h-4 text-green-500 mr-2" />
                          <span>Weight: {reading.weight} lbs</span>
                        </div>
                      )}
                      {reading.oxygen_saturation && (
                        <div className="flex items-center">
                          <Activity className="w-4 h-4 text-cyan-500 mr-2" />
                          <span>Oxygen: {reading.oxygen_saturation}%</span>
                        </div>
                      )}
                      {reading.pain_level && (
                        <div className="flex items-center">
                          <span>Pain Level: {reading.pain_level}/10</span>
                        </div>
                      )}
                    </div>
                    {reading.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Notes:</strong> {reading.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Trends Summary */}
          {trends.length > 0 && (
            <div className="border-t border-gray-200 pt-3">
              <h5 className="text-xs font-medium text-gray-700 mb-2">Recent Trends</h5>
              <div className="space-y-1">
                {trends.slice(0, 3).map((trend) => {
                  const TrendIcon = getTrendIcon(trend.vital_type);
                  const colorClass = getTrendColor(trend.vital_type);
                  
                  return (
                    <div key={trend.vital_type} className="flex items-center text-xs">
                      <TrendIcon className={`w-3 h-3 mr-2 ${colorClass}`} />
                      <span className="text-gray-700 capitalize">
                        {trend.vital_type.replace('_', ' ')}: {trend.trend}
                        {trend.change_percentage !== 0 && (
                          <span className="ml-1 text-gray-500">
                            ({trend.change_percentage > 0 ? '+' : ''}{trend.change_percentage.toFixed(1)}%)
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* View All Link */}
          {vitals.length > 5 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button 
                onClick={() => router.push('/patient?tab=health')}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                View all {vitals.length} recordings →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No vital signs recorded yet</p>
          <button
            onClick={onRecordVitals || (() => router.push('/patient/vitals/record'))}
            className="text-red-600 hover:text-red-700 text-sm mt-1 font-medium"
          >
            Record your first measurement
          </button>
        </div>
      )}
    </div>
  );
}