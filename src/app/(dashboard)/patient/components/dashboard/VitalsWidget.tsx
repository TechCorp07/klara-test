// src/app/(dashboard)/patient/components/dashboard/VitalsWidget.tsx
import React from 'react';
import { Heart, Thermometer, Weight, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface VitalsProps {
  vitals: {
    current: {
      blood_pressure?: string;
      heart_rate?: number;
      temperature?: number;
      weight?: number;
      oxygen_saturation?: number;
      pain_level?: number;
    };
    trends: {
      improving: string[];
      stable: string[];
      concerning: string[];
    };
    last_recorded: string;
  };
  onRecordVitals: () => void;
}

export function VitalsWidget({ vitals, onRecordVitals }: VitalsProps) {
  const formatLastRecorded = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Less than an hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const getVitalIcon = (vital: string) => {
    switch (vital.toLowerCase()) {
      case 'blood_pressure':
      case 'blood pressure':
        return <Heart className="w-4 h-4" />;
      case 'heart_rate':
      case 'heart rate':
        return <Activity className="w-4 h-4" />;
      case 'temperature':
        return <Thermometer className="w-4 h-4" />;
      case 'weight':
        return <Weight className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: 'improving' | 'stable' | 'concerning') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'concerning':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'improving' | 'stable' | 'concerning') => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50';
      case 'concerning':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getVitalStatus = (vital: string, value: number | string) => {
    switch (vital) {
      case 'heart_rate':
        const hr = value as number;
        if (hr < 60 || hr > 100) return 'concerning';
        if (hr < 70 || hr > 90) return 'stable';
        return 'improving';
      
      case 'temperature':
        const temp = value as number;
        if (temp < 97 || temp > 99.5) return 'concerning';
        return 'stable';
      
      case 'oxygen_saturation':
        const o2 = value as number;
        if (o2 < 95) return 'concerning';
        if (o2 < 98) return 'stable';
        return 'improving';
      
      case 'pain_level':
        const pain = value as number;
        if (pain > 7) return 'concerning';
        if (pain > 4) return 'stable';
        return 'improving';
      
      default:
        return 'stable';
    }
  };

  const hasRecentData = vitals.current && Object.keys(vitals.current).some(key => vitals.current[key as keyof typeof vitals.current] !== undefined);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Activity className="w-5 h-5 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
        </div>
        <button
          onClick={onRecordVitals}
          className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors"
        >
          Record
        </button>
      </div>

      {hasRecentData ? (
        <>
          {/* Current Vitals */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {vitals.current.blood_pressure && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <Heart className="w-4 h-4 text-red-600 mr-1" />
                  <span className="text-sm font-medium text-gray-900">Blood Pressure</span>
                </div>
                <div className="text-lg font-bold text-gray-900">{vitals.current.blood_pressure}</div>
                <div className="text-xs text-gray-600">mmHg</div>
              </div>
            )}

            {vitals.current.heart_rate && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <Activity className="w-4 h-4 text-red-600 mr-1" />
                  <span className="text-sm font-medium text-gray-900">Heart Rate</span>
                </div>
                <div className="text-lg font-bold text-gray-900">{vitals.current.heart_rate}</div>
                <div className="text-xs text-gray-600">bpm</div>
              </div>
            )}

            {vitals.current.temperature && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <Thermometer className="w-4 h-4 text-red-600 mr-1" />
                  <span className="text-sm font-medium text-gray-900">Temperature</span>
                </div>
                <div className="text-lg font-bold text-gray-900">{vitals.current.temperature}°F</div>
                <div className="text-xs text-gray-600">Fahrenheit</div>
              </div>
            )}

            {vitals.current.oxygen_saturation && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <Activity className="w-4 h-4 text-red-600 mr-1" />
                  <span className="text-sm font-medium text-gray-900">O₂ Sat</span>
                </div>
                <div className="text-lg font-bold text-gray-900">{vitals.current.oxygen_saturation}%</div>
                <div className="text-xs text-gray-600">SpO₂</div>
              </div>
            )}

            {vitals.current.weight && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <Weight className="w-4 h-4 text-red-600 mr-1" />
                  <span className="text-sm font-medium text-gray-900">Weight</span>
                </div>
                <div className="text-lg font-bold text-gray-900">{vitals.current.weight}</div>
                <div className="text-xs text-gray-600">lbs</div>
              </div>
            )}

            {vitals.current.pain_level !== undefined && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center mb-1">
                  <Activity className="w-4 h-4 text-red-600 mr-1" />
                  <span className="text-sm font-medium text-gray-900">Pain Level</span>
                </div>
                <div className="text-lg font-bold text-gray-900">{vitals.current.pain_level}/10</div>
                <div className="text-xs text-gray-600">Scale</div>
              </div>
            )}
          </div>

          {/* Trends Summary */}
          <div className="space-y-2">
            {vitals.trends.concerning.length > 0 && (
              <div className="flex items-center text-sm">
                <TrendingDown className="w-4 h-4 text-red-600 mr-2" />
                <span className="text-red-700">
                  Concerning: {vitals.trends.concerning.join(', ')}
                </span>
              </div>
            )}

            {vitals.trends.improving.length > 0 && (
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-green-700">
                  Improving: {vitals.trends.improving.join(', ')}
                </span>
              </div>
            )}

            {vitals.trends.stable.length > 0 && (
              <div className="flex items-center text-sm">
                <Minus className="w-4 h-4 text-gray-600 mr-2" />
                <span className="text-gray-700">
                  Stable: {vitals.trends.stable.join(', ')}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              Last recorded: {formatLastRecorded(vitals.last_recorded)}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Activity className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No recent vital signs recorded</p>
          <button
            onClick={onRecordVitals}
            className="text-red-600 hover:text-red-700 text-sm mt-1"
          >
            Record your first measurement
          </button>
        </div>
      )}
    </div>
  );
}