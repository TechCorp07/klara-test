// src/app/(dashboard)/patient/components/dashboard/HealthAlertsWidget.tsx
import React from 'react';
import { AlertTriangle, Bell, X, CheckCircle, Clock, Calendar, Pill, Activity } from 'lucide-react';

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
  onAcknowledgeAlert?: (alertId: number) => void;
}

export function HealthAlertsWidget({ alerts, onAcknowledgeAlert }: HealthAlertsProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 5) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          container: 'border-red-500 bg-red-50',
          icon: 'text-red-600',
          title: 'text-red-900',
          badge: 'bg-red-600 text-white'
        };
      case 'high':
        return {
          container: 'border-orange-500 bg-orange-50',
          icon: 'text-orange-600',
          title: 'text-orange-900',
          badge: 'bg-orange-600 text-white'
        };
      case 'medium':
        return {
          container: 'border-yellow-500 bg-yellow-50',
          icon: 'text-yellow-600',
          title: 'text-yellow-900',
          badge: 'bg-yellow-600 text-white'
        };
      default:
        return {
          container: 'border-blue-500 bg-blue-50',
          icon: 'text-blue-600',
          title: 'text-blue-900',
          badge: 'bg-blue-600 text-white'
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medication':
        return <Pill className="w-4 h-4" />;
      case 'appointment':
        return <Calendar className="w-4 h-4" />;
      case 'health':
        return <Activity className="w-4 h-4" />;
      case 'research':
        return <Bell className="w-4 h-4" />;
      case 'system':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  // Sort alerts by severity and creation time
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const unacknowledgedAlerts = sortedAlerts.filter(alert => !alert.acknowledged);
  const criticalAlerts = sortedAlerts.filter(alert => alert.severity === 'critical' && !alert.acknowledged);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Bell className="w-5 h-5 text-yellow-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Health Alerts</h3>
          {unacknowledgedAlerts.length > 0 && (
            <span className="ml-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              {unacknowledgedAlerts.length}
            </span>
          )}
        </div>
        
        {criticalAlerts.length > 0 && (
          <div className="flex items-center text-red-600">
            <AlertTriangle className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">{criticalAlerts.length} Critical</span>
          </div>
        )}
      </div>

      {unacknowledgedAlerts.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {unacknowledgedAlerts.slice(0, 5).map((alert) => {
            const styles = getSeverityStyles(alert.severity);
            
            return (
              <div
                key={alert.id}
                className={`border-l-4 rounded-lg p-3 ${styles.container}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <div className={`mr-3 mt-0.5 ${styles.icon}`}>
                      {getTypeIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <h4 className={`font-medium text-sm ${styles.title}`}>
                          {alert.title}
                        </h4>
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${styles.badge}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">
                        {alert.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-600">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{formatTime(alert.created_at)}</span>
                          <span className="mx-2">•</span>
                          <span className="capitalize">{alert.type}</span>
                        </div>
                        
                        {alert.action_required && (
                          <div className="text-xs text-gray-600">
                            Action Required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-2">
                    {alert.action_url && (
                      <button
                        onClick={() => window.location.href = alert.action_url!}
                        className="text-xs bg-white text-gray-700 border border-gray-300 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
                      >
                        View
                      </button>
                    )}
                    
                    {onAcknowledgeAlert && (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="text-xs bg-white text-gray-700 border border-gray-300 p-1 rounded hover:bg-gray-50 transition-colors"
                        title="Acknowledge alert"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {unacknowledgedAlerts.length > 5 && (
            <div className="text-center py-2">
              <button className="text-sm text-blue-600 hover:text-blue-700">
                View {unacknowledgedAlerts.length - 5} more alerts
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
          <p className="text-sm">All caught up!</p>
          <p className="text-xs text-gray-400 mt-1">
            No new health alerts. Check back regularly for important updates.
          </p>
        </div>
      )}

      {/* Alert Summary */}
      {alerts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
            <div>
              <span className="font-medium">Total alerts: </span>
              <span>{alerts.length}</span>
            </div>
            <div>
              <span className="font-medium">Acknowledged: </span>
              <span>{alerts.filter(a => a.acknowledged).length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}