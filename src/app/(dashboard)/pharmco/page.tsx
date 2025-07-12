// src/app/(dashboard)/pharmco/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Spinner } from '@/components/ui/spinner';

interface PharmcoStats {
  active_medications: number;
  clinical_trials: number;
  adverse_events: number;
  new_prescriptions: number;
  consented_patients: number;
  medication_adherence_data: number;
  regulatory_submissions: number;
  data_points_collected: number;
  monitored_conditions: string[];
}

interface Activity {
  id: number;
  type: 'clinical_trial' | 'adverse_event' | 'medication_approval' | 'data_collection' | 'regulatory_update' | 'consent_change';
  description: string;
  date: string;
  priority?: 'high' | 'medium' | 'low';
  requires_action?: boolean;
}

export default function PharmcoDashboard() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<PharmcoStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (user?.role === 'pharmco') {
      fetchPharmcoData();
    }
  }, [user]);

  const fetchPharmcoData = async () => {
    // In real implementation, this would call pharmaceutical company specific APIs
    setTimeout(() => {
      const mockStats: PharmcoStats = {
        active_medications: 12,
        clinical_trials: 5,
        adverse_events: 2,
        new_prescriptions: 87,
        consented_patients: 234,
        medication_adherence_data: 1850,
        regulatory_submissions: 3,
        data_points_collected: 15420,
        monitored_conditions: ['NMOSD', 'Multiple Sclerosis', 'Rare Neurological Disorders']
      };

      const mockActivities: Activity[] = [
        {
          id: 1,
          type: 'adverse_event',
          description: 'New adverse event reported for Rituximab - Grade 2 infusion reaction',
          date: '2024-01-15',
          priority: 'high',
          requires_action: true
        },
        {
          id: 2,
          type: 'clinical_trial',
          description: 'Phase III trial enrollment milestone reached - 200 patients',
          date: '2024-01-18',
          priority: 'medium',
          requires_action: false
        },
        {
          id: 3,
          type: 'regulatory_update',
          description: 'FDA submission deadline approaching for IND application',
          date: '2024-01-20',
          priority: 'high',
          requires_action: true
        },
        {
          id: 4,
          type: 'medication_approval',
          description: 'Ocrelizumab dosing protocol update approved by IRB',
          date: '2024-01-17',
          priority: 'medium',
          requires_action: false
        },
        {
          id: 5,
          type: 'data_collection',
          description: '1,250 new medication adherence data points collected',
          date: '2024-01-19',
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
    return `${greeting}, ${user?.first_name || 'Pharmaceutical Researcher'}`;
  };

  const handleAdverseEvent = () => {
    console.log('Opening adverse event investigation...');
  };

  const handleRegulatorySubmission = () => {
    console.log('Opening regulatory submission interface...');
  };

  const handleDataAnalysis = () => {
    console.log('Opening data analysis tools...');
  };

  if (isLoading || !user || user.role !== 'pharmco') {
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
        <p className="text-lg text-gray-600">Pharmaceutical Research & Development Dashboard</p>
      </div>

      {stats && (
        <>
          {/* Critical Actions Alert */}
          {(stats.adverse_events > 0 || stats.regulatory_submissions > 0) && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">Regulatory & Safety Alerts</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {stats.adverse_events > 0 && (
                        <li>{stats.adverse_events} adverse events require investigation and reporting</li>
                      )}
                      {stats.regulatory_submissions > 0 && (
                        <li>{stats.regulatory_submissions} regulatory submissions pending deadline</li>
                      )}
                    </ul>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    {stats.adverse_events > 0 && (
                      <button onClick={handleAdverseEvent} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                        Review Adverse Events
                      </button>
                    )}
                    {stats.regulatory_submissions > 0 && (
                      <button onClick={handleRegulatorySubmission} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                        Review Submissions
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Drug Development Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Drug Development Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Active Medications</p>
                <p className="mt-1 text-3xl font-semibold text-blue-600">{stats.active_medications}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Clinical Trials</p>
                <p className="mt-1 text-3xl font-semibold text-green-600">{stats.clinical_trials}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Adverse Events</p>
                <p className="mt-1 text-3xl font-semibold text-red-600">{stats.adverse_events}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">New Prescriptions</p>
                <p className="mt-1 text-3xl font-semibold text-purple-600">{stats.new_prescriptions}</p>
              </div>
            </div>
          </div>

          {/* Data Collection Metrics */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Real-World Data Collection</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Consented Patients</p>
                <p className="mt-1 text-2xl font-semibold text-blue-600">{stats.consented_patients}</p>
                <p className="text-xs text-gray-400 mt-1">Medication monitoring consent</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Adherence Data Points</p>
                <p className="mt-1 text-2xl font-semibold text-green-600">{stats.medication_adherence_data}</p>
                <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Total Data Points</p>
                <p className="mt-1 text-2xl font-semibold text-purple-600">{stats.data_points_collected.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">All time collection</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Regulatory Submissions</p>
                <p className="mt-1 text-2xl font-semibold text-orange-600">{stats.regulatory_submissions}</p>
                <p className="text-xs text-gray-400 mt-1">Pending deadlines</p>
              </div>
            </div>
          </div>

          {/* Monitored Conditions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Monitored Conditions</h2>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-wrap gap-2">
                {stats.monitored_conditions.map((condition, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {condition}
                  </span>
                ))}
              </div>
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
                      {activity.type === 'clinical_trial' ? '🧪' :
                       activity.type === 'adverse_event' ? '⚠️' :
                       activity.type === 'medication_approval' ? '💊' :
                       activity.type === 'data_collection' ? '📊' :
                       activity.type === 'regulatory_update' ? '📋' :
                       activity.type === 'consent_change' ? '📝' : '🔬'}
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
                      {activity.type === 'adverse_event' ? 'Investigate' :
                       activity.type === 'regulatory_update' ? 'Review' :
                       activity.type === 'clinical_trial' ? 'Manage' :
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
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Research & Development Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Clinical Trial Management</h3>
            <p className="mt-1 text-sm text-gray-500">Manage ongoing clinical trials and patient enrollment</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Medication Monitoring</h3>
            <p className="mt-1 text-sm text-gray-500">Track real-world medication adherence and outcomes</p>
          </button>
          <button 
            onClick={handleAdverseEvent}
            className="p-4 bg-red-50 border border-red-200 shadow rounded-lg hover:bg-red-100 text-left transition-colors"
          >
            <h3 className="text-lg font-medium text-red-900">Adverse Event Reporting</h3>
            <p className="mt-1 text-sm text-red-600">Report and investigate adverse drug reactions</p>
          </button>
          <button 
            onClick={handleRegulatorySubmission}
            className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <h3 className="text-lg font-medium text-gray-900">Regulatory Compliance</h3>
            <p className="mt-1 text-sm text-gray-500">Manage FDA submissions and regulatory requirements</p>
          </button>
          <button 
            onClick={handleDataAnalysis}
            className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <h3 className="text-lg font-medium text-gray-900">Data Analytics</h3>
            <p className="mt-1 text-sm text-gray-500">Analyze real-world evidence and treatment outcomes</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Patient Registry</h3>
            <p className="mt-1 text-sm text-gray-500">Access consented patient data for research purposes</p>
          </button>
        </div>
      </div>
    </div>
  );
}