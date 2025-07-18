// src/app/(dashboard)/patient/components/dashboard/VitalsWidget.tsx
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
    const getVitalStatus = (vital: string, value: number | string) => {
      // Basic vital signs ranges - in production, these should be personalized
      if (vital === 'heart_rate' && typeof value === 'number') {
        if (value >= 60 && value <= 100) return 'normal';
        if (value >= 50 && value < 60) return 'low';
        if (value > 100 && value <= 120) return 'elevated';
        return 'concerning';
      }
      if (vital === 'temperature' && typeof value === 'number') {
        if (value >= 97.0 && value <= 99.5) return 'normal';
        if (value < 97.0) return 'low';
        if (value > 99.5 && value <= 101.0) return 'elevated';
        return 'concerning';
      }
      if (vital === 'oxygen_saturation' && typeof value === 'number') {
        if (value >= 95) return 'normal';
        if (value >= 90) return 'low';
        return 'concerning';
      }
      return 'normal';
    };
  
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'normal': return 'text-green-600';
        case 'low': return 'text-yellow-600';
        case 'elevated': return 'text-orange-600';
        case 'concerning': return 'text-red-600';
        default: return 'text-gray-600';
      }
    };
  
    const formatVital = (vital: string, value: number | string) => {
      if (vital === 'temperature') return `${value}°F`;
      if (vital === 'heart_rate') return `${value} bpm`;
      if (vital === 'oxygen_saturation') return `${value}%`;
      if (vital === 'weight') return `${value} lbs`;
      if (vital === 'pain_level') return `${value}/10`;
      return value.toString();
    };
  
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
          <button
            onClick={onRecordVitals}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
          >
            Record
          </button>
        </div>
  
        {/* Current Vitals */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {Object.entries(vitals.current).map(([key, value]) => {
            if (!value) return null;
            const status = getVitalStatus(key, value);
            const displayName = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            return (
              <div key={key} className="text-center">
                <div className={`text-xl font-bold ${getStatusColor(status)}`}>
                  {formatVital(key, value)}
                </div>
                <div className="text-sm text-gray-600">{displayName}</div>
              </div>
            );
          })}
        </div>
  
        {/* Trends */}
        {(vitals.trends.concerning.length > 0 || vitals.trends.improving.length > 0) && (
          <div className="space-y-3 mb-4">
            {vitals.trends.concerning.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-red-800">Concerning Trends</span>
                </div>
                <div className="text-sm text-red-700">
                  {vitals.trends.concerning.join(', ')}
                </div>
              </div>
            )}
  
            {vitals.trends.improving.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-green-800">Improving</span>
                </div>
                <div className="text-sm text-green-700">
                  {vitals.trends.improving.join(', ')}
                </div>
              </div>
            )}
          </div>
        )}
  
        <div className="text-xs text-gray-500">
          Last recorded: {new Date(vitals.last_recorded).toLocaleDateString()} at {new Date(vitals.last_recorded).toLocaleTimeString()}
        </div>
      </div>
    );
  }
  