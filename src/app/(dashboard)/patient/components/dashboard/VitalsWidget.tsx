// src/app/(dashboard)/patient/components/dashboard/VitalsWidget.tsx
import React, { useState } from 'react';
import { 
  Heart, 
  Thermometer, 
  Weight, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ChevronDown, 
  ChevronRight,
  Clock,
  Plus
} from 'lucide-react';

interface VitalReading {
  id: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  temperature?: number;
  weight?: number;
  oxygen_saturation?: number;
  pain_level?: number;
  notes?: string;
  recorded_date: string;
}

interface VitalsProps {
  vitals: {
    recent_recordings: VitalReading[];
    trends: {
      improving: string[];
      stable: string[];
      concerning: string[];
    };
  };
  onRecordVitals: () => void;
}

export function VitalsWidget({ vitals, onRecordVitals }: VitalsProps) {
  const [expandedRecording, setExpandedRecording] = useState<number | null>(null);

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

  const getRecordingSummary = (reading: VitalReading) => {
    const measurements: string[] = [];
    
    if (reading.blood_pressure_systolic || reading.blood_pressure_diastolic) {
      const bp = formatBloodPressure(reading.blood_pressure_systolic, reading.blood_pressure_diastolic);
      if (bp) measurements.push(`BP: ${bp}`);
    }
    if (reading.heart_rate) measurements.push(`HR: ${reading.heart_rate}`);
    if (reading.temperature) measurements.push(`Temp: ${reading.temperature}°F`);
    if (reading.weight) measurements.push(`Weight: ${reading.weight}lbs`);
    
    return measurements.slice(0, 3).join(' • ');
  };

  const toggleExpanded = (recordingId: number) => {
    setExpandedRecording(expandedRecording === recordingId ? null : recordingId);
  };

  const hasRecentData = vitals.recent_recordings && vitals.recent_recordings.length > 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Activity className="w-5 h-5 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
        </div>
        <button
          onClick={onRecordVitals}
          className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" />
          Record
        </button>
      </div>

      {hasRecentData ? (
        <>
          {/* Recent Recordings List */}
          <div className="space-y-3 mb-4">
            {vitals.recent_recordings.slice(0, 5).map((reading) => (
              <div key={reading.id} className="border border-gray-200 rounded-lg">
                <div 
                  className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpanded(reading.id)}
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
                      {expandedRecording === reading.id ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRecording === reading.id && (
                  <div className="px-3 pb-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {formatBloodPressure(reading.blood_pressure_systolic, reading.blood_pressure_diastolic) && (
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="flex items-center mb-1">
                            <Heart className="w-3 h-3 text-red-600 mr-1" />
                            <span className="text-xs font-medium text-gray-900">Blood Pressure</span>
                          </div>
                          <div className="text-sm font-bold text-gray-900">
                            {formatBloodPressure(reading.blood_pressure_systolic, reading.blood_pressure_diastolic)}
                          </div>
                          <div className="text-xs text-gray-600">mmHg</div>
                        </div>
                      )}

                      {reading.heart_rate && (
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="flex items-center mb-1">
                            <Activity className="w-3 h-3 text-red-600 mr-1" />
                            <span className="text-xs font-medium text-gray-900">Heart Rate</span>
                          </div>
                          <div className="text-sm font-bold text-gray-900">{reading.heart_rate}</div>
                          <div className="text-xs text-gray-600">bpm</div>
                        </div>
                      )}

                      {reading.temperature && (
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="flex items-center mb-1">
                            <Thermometer className="w-3 h-3 text-red-600 mr-1" />
                            <span className="text-xs font-medium text-gray-900">Temperature</span>
                          </div>
                          <div className="text-sm font-bold text-gray-900">{reading.temperature}°F</div>
                          <div className="text-xs text-gray-600">Fahrenheit</div>
                        </div>
                      )}

                      {reading.weight && (
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="flex items-center mb-1">
                            <Weight className="w-3 h-3 text-red-600 mr-1" />
                            <span className="text-xs font-medium text-gray-900">Weight</span>
                          </div>
                          <div className="text-sm font-bold text-gray-900">{reading.weight}</div>
                          <div className="text-xs text-gray-600">lbs</div>
                        </div>
                      )}

                      {reading.oxygen_saturation && (
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="flex items-center mb-1">
                            <Activity className="w-3 h-3 text-red-600 mr-1" />
                            <span className="text-xs font-medium text-gray-900">O₂ Sat</span>
                          </div>
                          <div className="text-sm font-bold text-gray-900">{reading.oxygen_saturation}%</div>
                          <div className="text-xs text-gray-600">SpO₂</div>
                        </div>
                      )}

                      {reading.pain_level !== undefined && (
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="flex items-center mb-1">
                            <Activity className="w-3 h-3 text-red-600 mr-1" />
                            <span className="text-xs font-medium text-gray-900">Pain Level</span>
                          </div>
                          <div className="text-sm font-bold text-gray-900">{reading.pain_level}/10</div>
                          <div className="text-xs text-gray-600">Scale</div>
                        </div>
                      )}
                    </div>

                    {reading.notes && (
                      <div className="mt-3 p-2 bg-blue-50 rounded">
                        <div className="text-xs font-medium text-blue-900 mb-1">Notes</div>
                        <div className="text-sm text-blue-800">{reading.notes}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Trends Summary */}
          {(vitals.trends.concerning.length > 0 || vitals.trends.improving.length > 0 || vitals.trends.stable.length > 0) && (
            <div className="space-y-2 pt-3 border-t border-gray-200">
              <div className="text-xs font-medium text-gray-900 mb-2">Health Trends</div>
              
              {vitals.trends.concerning.length > 0 && (
                <div className="flex items-center text-xs">
                  <TrendingDown className="w-3 h-3 text-red-600 mr-2" />
                  <span className="text-red-700">
                    Concerning: {vitals.trends.concerning.join(', ')}
                  </span>
                </div>
              )}

              {vitals.trends.improving.length > 0 && (
                <div className="flex items-center text-xs">
                  <TrendingUp className="w-3 h-3 text-green-600 mr-2" />
                  <span className="text-green-700">
                    Improving: {vitals.trends.improving.join(', ')}
                  </span>
                </div>
              )}

              {vitals.trends.stable.length > 0 && (
                <div className="flex items-center text-xs">
                  <Minus className="w-3 h-3 text-gray-600 mr-2" />
                  <span className="text-gray-700">
                    Stable: {vitals.trends.stable.join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* View All Link */}
          {vitals.recent_recordings.length > 5 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                View all {vitals.recent_recordings.length} recordings →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No vital signs recorded yet</p>
          <button
            onClick={onRecordVitals}
            className="text-red-600 hover:text-red-700 text-sm mt-1 font-medium"
          >
            Record your first measurement
          </button>
        </div>
      )}
    </div>
  );
}