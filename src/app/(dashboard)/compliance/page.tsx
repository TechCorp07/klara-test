// src/app/(dashboard)/compliance/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Spinner } from '@/components/ui/spinner';

interface ComplianceStats {
  total_requests: number;
  pending_review: number;
  recent_requests: number;
  justified_access: number;
  unjustified_access: number;
  by_reason: {
    LIFE_THREATENING: number;
    URGENT_CARE: number;
    PATIENT_UNABLE: number;
    IMMINENT_DANGER: number;
    OTHER: number;
  };
  active_sessions: number;
  consent_records_today: number;
  audit_logs_generated: number;
  security_incidents: number;
}

interface Activity {
  id: number;
  type: 'emergency_access' | 'consent_change' | 'security_incident' | 'audit_review' | 'phi_access' | 'document_update';
  description: string;
  date: string;
  priority?: 'high' | 'medium' | 'low';
  requires_action?: boolean;
}

export default function ComplianceDashboard() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (user?.role === 'compliance') {
      fetchComplianceData();
    }
  }, [user]);

  const fetchComplianceData = async () => {
    // In real implementation, this would call /users/compliance/emergency-summary/
    setTimeout(() => {
      const mockStats: ComplianceStats = {
        total_requests: 15,
        pending_review: 2,
        recent_requests: 8,
        justified_access: 12,
        unjustified_access: 1,
        by_reason: {
          LIFE_THREATENING: 5,
          URGENT_CARE: 10,
          PATIENT_UNABLE: 0,
          IMMINENT_DANGER: 0,
          OTHER: 0
        },
        active_sessions: 1,
        consent_records_today: 24,
        audit_logs_generated: 156,
        security_incidents: 0
      };

      const mockActivities: Activity[] = [
        {
          id: 1,
          type: 'emergency_access',
          description: 'Emergency PHI access by Dr. Smith requires review',
          date: '2024-01-15',
          priority: 'high',
          requires_action: true
        },
        {
          id: 2,
          type: 'security_incident',
          description: 'Failed login attempts detected from IP 192.168.1.100',
          date: '2024-01-18',
          priority: 'medium',
          requires_action: true
        },
        {
          id: 3,
          type: 'consent_change',
          description: '5 patients updated research participation consent',
          date: '2024-01-19',
          priority: 'low',
          requires_action: false
        },
        {
          id: 4,
          type: 'phi_access',
          description: 'Unusual PHI access pattern detected for researcher',
          date: '2024-01-17',
          priority: 'medium',
          requires_action: true
        },
        {
          id: 5,
          type: 'document_update',
          description: 'Privacy Notice v2.1 requires activation',
          date: '2024-01-16',
          priority: 'medium',
          requires_action: false
        }
      ];

      setStats(mockStats);
      setActivities(mockActivities);
    }, 500);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${user?.first_name || 'Compliance Officer'}`;
  };

  if (isLoading || !user || user.role !== 'compliance') {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{getGreeting()}</h1>
        <p className="text-lg text-gray-600">HIPAA Compliance & Security Dashboard</p>
      </div>

      {stats && (
        <>
          {/* Critical Compliance Alerts */}
          {(stats.pending_review > 0 || stats.security_incidents > 0 || stats.active_sessions > 0) && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">Compliance Review Required</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {stats.pending_review > 0 && (
                        <li>{stats.pending_review} emergency access events pending review</li>
                      )}
                      {stats.active_sessions > 0 && (
                        <li>{stats.active_sessions} active emergency access session(s)</li>
                      )}
                      {stats.security_incidents > 0 && (
                        <li>{stats.security_incidents} security incidents require investigation</li>
                      )}
                    </ul>
                  </div>
                  <div className="mt-4">
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Access Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Emergency Access Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <p className="mt-1 text-3xl font-semibold text-blue-600">{stats.total_requests}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="mt-1 text-3xl font-semibold text-red-600">{stats.pending_review}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Justified Access</p>
                <p className="mt-1 text-3xl font-semibold text-green-600">{stats.justified_access}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Active Sessions</p>
                <p className="mt-1 text-3xl font-semibold text-orange-600">{stats.active_sessions}</p>
              </div>
            </div>
          </div>

          {/* Emergency Access by Reason */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Emergency Access by Reason</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(stats.by_reason).map(([reason, count]) => (
                <div key={reason} className="bg-white rounded-lg shadow p-4 text-center">
                  <p className="text-sm font-medium text-gray-500">
                    {reason.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Metrics */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Compliance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Consent Records Today</p>
                <p className="mt-1 text-2xl font-semibold text-blue-600">{stats.consent_records_today}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Audit Logs Generated</p>
                <p className="mt-1 text-2xl font-semibold text-green-600">{stats.audit_logs_generated}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Security Incidents</p>
                <p className="mt-1 text-2xl font-semibold text-red-600">{stats.security_incidents}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Unjustified Access</p>
                <p className="mt-1 text-2xl font-semibold text-orange-600">{stats.unjustified_access}</p>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Compliance Activity</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <li key={activity.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${
                      activity.priority === 'high' ? 'bg-red-100 text-red-600' :
                      activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.type === 'emergency_access' ? '🚨' :
                       activity.type === 'consent_change' ? '📋' :
                       activity.type === 'security_incident' ? '🔒' :
                       activity.type === 'audit_review' ? '📊' :
                       activity.type === 'phi_access' ? '👁️' :
                       activity.type === 'document_update' ? '📄' : '📝'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-500">{activity.date}</p>
                    {activity.requires_action && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 mt-1">
                        Action Required
                      </span>
                    )}
                  </div>
                  <div>
                    <button className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md ${
                      activity.requires_action 
                        ? 'text-red-700 bg-red-100 hover:bg-red-200' 
                        : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                    }`}>
                      {activity.type === 'emergency_access' ? 'Review' :
                       activity.type === 'security_incident' ? 'Investigate' :
                       activity.type === 'phi_access' ? 'Audit' :
                       'View'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Compliance Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <h3 className="text-lg font-medium text-gray-900">Emergency Access Review</h3>
            <p className="mt-1 text-sm text-gray-500">Review and approve emergency PHI access events</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Audit Trail Monitoring</h3>
            <p className="mt-1 text-sm text-gray-500">Monitor system access logs and user activity</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Consent Management</h3>
            <p className="mt-1 text-sm text-gray-500">Track patient consent changes and e-signatures</p>
          </button>
          <button 
            className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <h3 className="text-lg font-medium text-gray-900">Security Monitoring</h3>
            <p className="mt-1 text-sm text-gray-500">Monitor security incidents and breach attempts</p>
          </button>
          <button 
            className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <h3 className="text-lg font-medium text-gray-900">Compliance Reports</h3>
            <p className="mt-1 text-sm text-gray-500">Generate HIPAA compliance and audit reports</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Data Breach Response</h3>
            <p className="mt-1 text-sm text-gray-500">Manage data breach protocols and notifications</p>
          </button>
        </div>
      </div>
    </div>
  );
}