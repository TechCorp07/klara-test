// src/app/(dashboard)/researcher/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Spinner } from '@/components/ui/spinner';

interface ResearcherStats {
  active_studies: number;
  enrolled_subjects: number;
  data_points_collected: number;
  pending_analyses: number;
  consented_participants: number;
  completed_studies: number;
  irb_approvals: number;
  publications: number;
  verification_status: boolean;
}

interface Activity {
  id: number;
  type: 'study_enrollment' | 'data_collection' | 'irb_approval' | 'analysis_complete' | 'publication' | 'consent_update';
  description: string;
  date: string;
  priority?: 'high' | 'medium' | 'low';
  study_id?: string;
  requires_action?: boolean;
}

export default function ResearcherDashboard() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<ResearcherStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (user?.role === 'researcher') {
      fetchResearcherData();
    }
  }, [user]);

  const fetchResearcherData = async () => {
    // In real implementation, this would call research-specific APIs
    setTimeout(() => {
      const mockStats: ResearcherStats = {
        active_studies: 3,
        enrolled_subjects: 145,
        data_points_collected: 12850,
        pending_analyses: 2,
        consented_participants: 234,
        completed_studies: 5,
        irb_approvals: 8,
        publications: 12,
        verification_status: true
      };

      const mockActivities: Activity[] = [
        {
          id: 1,
          type: 'study_enrollment',
          description: 'New participant enrolled in NMOSD longitudinal study',
          date: '2024-01-15',
          priority: 'medium',
          study_id: 'IRB-2024-001',
          requires_action: false
        },
        {
          id: 2,
          type: 'irb_approval',
          description: 'IRB approval renewal required for Rare Disease Registry Study',
          date: '2024-01-20',
          priority: 'high',
          study_id: 'IRB-2023-045',
          requires_action: true
        },
        {
          id: 3,
          type: 'data_collection',
          description: '500 new biomarker data points collected from wearable devices',
          date: '2024-01-18',
          priority: 'low',
          requires_action: false
        },
        {
          id: 4,
          type: 'analysis_complete',
          description: 'Statistical analysis completed for MS treatment efficacy study',
          date: '2024-01-17',
          priority: 'medium',
          study_id: 'IRB-2023-112',
          requires_action: false
        },
        {
          id: 5,
          type: 'consent_update',
          description: '15 participants updated research consent preferences',
          date: '2024-01-16',
          priority: 'low',
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
    return `${greeting}, ${user?.first_name ? `Dr. ${user.first_name}` : 'Researcher'}`;
  };

  const handleDataAccess = () => {
    // Handle data access click
  };

  if (isLoading || !user || user.role !== 'researcher') {
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
        <p className="text-lg text-gray-600">Clinical Research Dashboard</p>
      </div>

      {stats && (
        <>
          {/* Verification Status Alert */}
          {!stats.verification_status && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">Researcher Verification Required</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Your researcher credentials require verification before accessing patient data. Please contact the administrator.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Research Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Research Portfolio Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Active Studies</p>
                <p className="mt-1 text-3xl font-semibold text-blue-600">{stats.active_studies}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Enrolled Subjects</p>
                <p className="mt-1 text-3xl font-semibold text-green-600">{stats.enrolled_subjects}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Data Points Collected</p>
                <p className="mt-1 text-3xl font-semibold text-purple-600">{stats.data_points_collected.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Pending Analyses</p>
                <p className="mt-1 text-3xl font-semibold text-orange-600">{stats.pending_analyses}</p>
              </div>
            </div>
          </div>

          {/* Research Metrics */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Research Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Consented Participants</p>
                <p className="mt-1 text-2xl font-semibold text-blue-600">{stats.consented_participants}</p>
                <p className="text-xs text-gray-400 mt-1">Research participation consent</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Completed Studies</p>
                <p className="mt-1 text-2xl font-semibold text-green-600">{stats.completed_studies}</p>
                <p className="text-xs text-gray-400 mt-1">All time</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">IRB Approvals</p>
                <p className="mt-1 text-2xl font-semibold text-purple-600">{stats.irb_approvals}</p>
                <p className="text-xs text-gray-400 mt-1">Active and historical</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Publications</p>
                <p className="mt-1 text-2xl font-semibold text-indigo-600">{stats.publications}</p>
                <p className="text-xs text-gray-400 mt-1">Peer-reviewed</p>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Researcher Status</h2>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Verification Status</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stats.verification_status ? 'Verified Researcher' : 'Pending Verification'}
                  </p>
                </div>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  stats.verification_status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {stats.verification_status ? 'Verified' : 'Pending'}
                </span>
              </div>
              {stats.verification_status && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>You have full access to anonymized research data for consented participants.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Research Activity</h2>
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
                      {activity.type === 'study_enrollment' ? '👥' :
                       activity.type === 'data_collection' ? '📊' :
                       activity.type === 'irb_approval' ? '📋' :
                       activity.type === 'analysis_complete' ? '🔬' :
                       activity.type === 'publication' ? '📄' :
                       activity.type === 'consent_update' ? '✅' : '🔬'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{activity.date}</span>
                      {activity.study_id && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600">{activity.study_id}</span>
                        </>
                      )}
                    </div>
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
                      {activity.type === 'irb_approval' ? 'Renew' :
                       activity.type === 'study_enrollment' ? 'Manage' :
                       activity.type === 'analysis_complete' ? 'Review' :
                       'View'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Research Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={handleDataAccess}
            className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <h3 className="text-lg font-medium text-gray-900">Research Data Access</h3>
            <p className="mt-1 text-sm text-gray-500">Access anonymized data for your approved studies</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Study Management</h3>
            <p className="mt-1 text-sm text-gray-500">Manage your current research studies and participants</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Analytics Tools</h3>
            <p className="mt-1 text-sm text-gray-500">Statistical analysis tools for research data</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-yellow-900">IRB Management</h3>
            <p className="mt-1 text-sm text-yellow-600">Manage IRB approvals and renewals</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Participant Registry</h3>
            <p className="mt-1 text-sm text-gray-500">View and manage research participants</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Ethics & Compliance</h3>
            <p className="mt-1 text-sm text-gray-500">Ensure ethical research practices and compliance</p>
          </button>
        </div>
      </div>
        </div>
  );
}
