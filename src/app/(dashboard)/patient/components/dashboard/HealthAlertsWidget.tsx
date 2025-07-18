// src/app/(dashboard)/patient/components/dashboard/HealthAlertsWidget.tsx
interface HealthAlertsProps {
    alerts: Array<{
      id: number;
      type: 'medication' | 'appointment' | 'health' | 'research' | 'system';
      severity: 'low' | 'medium' | 'high' | 'critical';
      title: string;
      message: string;
      created_at: string;
      acknowledged: boolean;
      action_required?: boolean;
      action_url?: string;
    }>;
    onAcknowledge: (alertId: number) => void;
  }
  
  export function HealthAlertsWidget({ alerts, onAcknowledge }: HealthAlertsProps) {
    if (!alerts.length) return null;
  
    const getSeverityStyle = (severity: string) => {
      switch (severity) {
        case 'critical': return 'bg-red-50 border-red-200 text-red-800';
        case 'high': return 'bg-orange-50 border-orange-200 text-orange-800';
        case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
        case 'low': return 'bg-blue-50 border-blue-200 text-blue-800';
        default: return 'bg-gray-50 border-gray-200 text-gray-800';
      }
    };
  
    const getSeverityIcon = (severity: string) => {
      const iconClass = severity === 'critical' ? 'text-red-600' : 
                       severity === 'high' ? 'text-orange-600' :
                       severity === 'medium' ? 'text-yellow-600' : 'text-blue-600';
      
      return (
        <svg className={`w-5 h-5 ${iconClass}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    };
  
    return (
      <div className="space-y-3">
        {alerts.filter(alert => !alert.acknowledged).map((alert) => (
          <div key={alert.id} className={`rounded-lg p-4 border ${getSeverityStyle(alert.severity)}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getSeverityIcon(alert.severity)}
                <div>
                  <div className="font-medium">{alert.title}</div>
                  <div className="text-sm mt-1">{alert.message}</div>
                  <div className="text-xs mt-2 opacity-75">
                    {new Date(alert.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {alert.action_url && (
                  <a
                    href={alert.action_url}
                    className="bg-white text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-50 transition-colors border"
                  >
                    Take Action
                  </a>
                )}
                <button
                  onClick={() => onAcknowledge(alert.id)}
                  className="bg-white text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-50 transition-colors border"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }