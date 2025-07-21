// src/app/(dashboard)/patient/components/dashboard/RareDiseaseMonitoringWidget.tsx
import React from 'react';
import { Activity, TrendingUp, TrendingDown, Minus, Heart, AlertTriangle, Calendar, User } from 'lucide-react';

interface RareDiseaseMonitoringProps {
  rareConditions: Array<{
    name: string;
    diagnosed_date: string;
    severity: 'mild' | 'moderate' | 'severe';
    specialist_provider?: string;
  }>;
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
}

export function RareDiseaseMonitoringWidget({ rareConditions, vitals }: RareDiseaseMonitoringProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': 
        return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': 
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'severe': 
        return 'text-red-600 bg-red-50 border-red-200';
      default: 
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'mild':
        return <Activity className="w-4 h-4 text-green-600" />;
      case 'moderate':
        return <Heart className="w-4 h-4 text-yellow-600" />;
      case 'severe':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
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

  const formatDiagnosisDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getMonitoringStatus = () => {
    const concerningCount = vitals.trends.concerning.length;
    const improvingCount = vitals.trends.improving.length;
    
    if (concerningCount > 0) {
      return { status: 'needs-attention', message: 'Requires attention', color: 'text-red-600' };
    } else if (improvingCount > 0) {
      return { status: 'improving', message: 'Improving trends', color: 'text-green-600' };
    } else {
      return { status: 'stable', message: 'Stable condition', color: 'text-gray-600' };
    }
  };

  const monitoringStatus = getMonitoringStatus();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Activity className="w-5 h-5 text-purple-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Rare Disease Monitoring</h3>
      </div>

      {/* Rare Conditions */}
      <div className="space-y-3 mb-6">
        {rareConditions.map((condition, index) => (
          <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(condition.severity)}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start">
                <div className="mr-2 mt-0.5">
                  {getSeverityIcon(condition.severity)}
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {condition.name}
                  </div>
                  <div className="flex items-center text-xs text-gray-600 mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Diagnosed: {formatDiagnosisDate(condition.diagnosed_date)}</span>
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getSeverityColor(condition.severity)}`}>
                {condition.severity}
              </span>
            </div>
            
            {condition.specialist_provider && (
              <div className="flex items-center text-xs text-gray-600 mt-2">
                <User className="w-3 h-3 mr-1" />
                <span>Specialist: {condition.specialist_provider}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Monitoring Status Overview */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">Current Status</h4>
          <span className={`text-sm font-medium ${monitoringStatus.color}`}>
            {monitoringStatus.message}
          </span>
        </div>
        
        {/* Key Vitals Summary */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {vitals.current.heart_rate && (
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-gray-600">Heart Rate</span>
              <span className="font-medium">{vitals.current.heart_rate} bpm</span>
            </div>
          )}
          
          {vitals.current.blood_pressure && (
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-gray-600">BP</span>
              <span className="font-medium">{vitals.current.blood_pressure}</span>
            </div>
          )}
          
          {vitals.current.pain_level !== undefined && (
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-gray-600">Pain</span>
              <span className="font-medium">{vitals.current.pain_level}/10</span>
            </div>
          )}
          
          {vitals.current.oxygen_saturation && (
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-gray-600">O₂ Sat</span>
              <span className="font-medium">{vitals.current.oxygen_saturation}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Trends Analysis */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-900">Health Trends</h4>
        
        {vitals.trends.concerning.length > 0 && (
          <div className="flex items-start p-2 bg-red-50 rounded">
            <TrendingDown className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-red-900">Concerning Trends</div>
              <div className="text-xs text-red-700">
                {vitals.trends.concerning.join(', ')}
              </div>
            </div>
          </div>
        )}

        {vitals.trends.improving.length > 0 && (
          <div className="flex items-start p-2 bg-green-50 rounded">
            <TrendingUp className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-green-900">Improving Trends</div>
              <div className="text-xs text-green-700">
                {vitals.trends.improving.join(', ')}
              </div>
            </div>
          </div>
        )}

        {vitals.trends.stable.length > 0 && (
          <div className="flex items-start p-2 bg-blue-50 rounded">
            <Minus className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-blue-900">Stable Indicators</div>
              <div className="text-xs text-blue-700">
                {vitals.trends.stable.join(', ')}
              </div>
            </div>
          </div>
        )}

        {vitals.trends.concerning.length === 0 && 
         vitals.trends.improving.length === 0 && 
         vitals.trends.stable.length === 0 && (
          <div className="text-center py-3 text-gray-500">
            <Activity className="w-6 h-6 mx-auto mb-1 text-gray-400" />
            <p className="text-xs">No trend data available</p>
            <p className="text-xs text-gray-400">Continue recording vitals to see trends</p>
          </div>
        )}
      </div>

      {/* Action Items */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-1 gap-2">
          {vitals.trends.concerning.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-2">
              <div className="text-xs font-medium text-red-800">Recommended Actions:</div>
              <div className="text-xs text-red-700">
                Contact your specialist about concerning trends
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center text-xs text-gray-600">
            <span>Last vital signs recorded</span>
            <span>{new Date(vitals.last_recorded).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}