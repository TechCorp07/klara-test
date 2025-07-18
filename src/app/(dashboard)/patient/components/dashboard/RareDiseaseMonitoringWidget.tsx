// src/app/(dashboard)/patient/components/dashboard/RareDiseaseMonitoringWidget.tsx
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
        case 'mild': return 'text-green-600 bg-green-50 border-green-200';
        case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        case 'severe': return 'text-red-600 bg-red-50 border-red-200';
        default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
    };
  
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Rare Disease Monitoring</h3>
        </div>
  
        {/* Rare Conditions */}
        <div className="space-y-3 mb-6">
          {rareConditions.map((condition, index) => (
            <div key={index} className={`rounded-lg p-3 border ${getSeverityColor(condition.severity)}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{condition.name}</div>
                  <div className="text-sm mt-1">
                    Diagnosed: {new Date(condition.diagnosed_date).toLocaleDateString()}
                  </div>
                  {condition.specialist_provider && (
                    <div className="text-sm">
                      Specialist: {condition.specialist_provider}
                    </div>
                  )}
                </div>
                <div className="text-sm font-medium capitalize">
                  {condition.severity}
                </div>
              </div>
            </div>
          ))}
        </div>
  
        {/* Vital Signs Trends */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Vital Signs Trends</h4>
          
          {vitals.trends.concerning.length > 0 && (
            <div className="mb-3">
              <div className="text-sm font-medium text-red-600 mb-1">Concerning Trends</div>
              <div className="space-y-1">
                {vitals.trends.concerning.map((vital, index) => (
                  <div key={index} className="text-sm text-red-700 bg-red-50 px-2 py-1 rounded">
                    {vital}
                  </div>
                ))}
              </div>
            </div>
          )}
  
          {vitals.trends.improving.length > 0 && (
            <div className="mb-3">
              <div className="text-sm font-medium text-green-600 mb-1">Improving</div>
              <div className="space-y-1">
                {vitals.trends.improving.map((vital, index) => (
                  <div key={index} className="text-sm text-green-700 bg-green-50 px-2 py-1 rounded">
                    {vital}
                  </div>
                ))}
              </div>
            </div>
          )}
  
          {vitals.trends.stable.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">Stable</div>
              <div className="space-y-1">
                {vitals.trends.stable.map((vital, index) => (
                  <div key={index} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    {vital}
                  </div>
                ))}
              </div>
            </div>
          )}
  
          <div className="mt-3 text-xs text-gray-500">
            Last recorded: {new Date(vitals.last_recorded).toLocaleString()}
          </div>
        </div>
      </div>
    );
  }  