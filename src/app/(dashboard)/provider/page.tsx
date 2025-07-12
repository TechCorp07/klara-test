// src/app/(dashboard)/provider/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Spinner } from '@/components/ui/spinner';

interface ProviderStats {
  todays_appointments: number;
  pending_messages: number;
  pending_lab_results: number;
  patients_seen_this_week: number;
  emergency_access_sessions: number;
  accepting_new_patients: boolean;
  telemedicine_available: boolean;
}

interface Activity {
  id: number;
  type: 'patient' | 'appointment' | 'lab' | 'message' | 'emergency' | 'verification';
  description: string;
  date: string;
  priority?: 'high' | 'medium' | 'low';
  patient_id?: number;
}

export default function ProviderDashboard() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (user?.role === 'provider') {
      fetchProviderData();
    }
  }, [user]);

  const fetchProviderData = async () => {
    // Simulate API call - replace with actual API calls
    setTimeout(() => {
      const mockStats: ProviderStats = {
        todays_appointments: 8,
        pending_messages: 5,
        pending_lab_results: 3,
        patients_seen_this_week: 22,
        emergency_access_sessions: 1,
        accepting_new_patients: true,
        telemedicine_available: true
      };

      const mockActivities: Activity[] = [
        {
          id: 1,
          type: 'emergency',
          description: 'Emergency access session active - Patient #12345',
          date: '2024-01-15',
          priority: 'high',
          patient_id: 12345
        },
        {
          id: 2,
          type: 'patient',
          description: 'New patient registered: John Doe - requires identity verification',
          date: '2024-01-18',
          priority: 'medium'
        },
        {
          id: 3,
          type: 'appointment',
          description: 'Appointment scheduled with Jane Smith for tomorrow',
          date: '2024-01-20',
          priority: 'medium'
        },
        {
          id: 4,
          type: 'lab',
          description: 'Lab results received for patient Mary Johnson',
          date: '2024-01-17',
          priority: 'high'
        },
        {
          id: 5,
          type: 'verification',
          description: 'Patient identity verification request pending',
          date: '2024-01-16',
          priority: 'medium'
        }
      ];

      setStats(mockStats);
      setActivities(mockActivities);
    }, 500);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, Dr. ${user?.last_name || user?.first_name || 'Doctor'}`;
  };

  const handleEmergencyAccess = () => {
    console.log('Initiating emergency access...');
  };

  const handleVerifyPatient = (patientId: number) => {
    console.log(`Verifying patient identity: ${patientId}`);
  };

  if (isLoading || !user || user.role !== 'provider') {
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
        <p className="text-lg text-gray-600">Provider Dashboard</p>
      </div>

      {stats && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Practice Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm font-medium text-gray-500">Today&apos;s Appointments</p>
              <p className="mt-1 text-3xl font-semibold text-blue-600">{stats.todays_appointments}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm font-medium text-gray-500">Pending Messages</p>
              <p className="mt-1 text-3xl font-semibold text-orange-600">{stats.pending_messages}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm font-medium text-gray-500">Lab Results Pending</p>
              <p className="mt-1 text-3xl font-semibold text-red-600">{stats.pending_lab_results}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm font-medium text-gray-500">Patients This Week</p>
              <p className="mt-1 text-3xl font-semibold text-green-600">{stats.patients_seen_this_week}</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicators */}
      {stats && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Practice Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Accepting New Patients</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  stats.accepting_new_patients ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {stats.accepting_new_patients ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Telemedicine Available</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  stats.telemedicine_available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {stats.telemedicine_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Emergency Access Sessions</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  stats.emergency_access_sessions > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {stats.emergency_access_sessions} Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
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
                      {activity.type === 'patient' ? '👤' :
                       activity.type === 'appointment' ? '📅' :
                       activity.type === 'lab' ? '🧪' :
                       activity.type === 'message' ? '💬' :
                       activity.type === 'emergency' ? '🚨' :
                       activity.type === 'verification' ? '🔒' : '📋'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-500">{activity.date}</p>
                  </div>
                  <div>
                    {activity.type === 'emergency' ? (
                      <button
                        onClick={handleEmergencyAccess}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
                      >
                        Manage
                      </button>
                    ) : activity.type === 'verification' ? (
                      <button
                        onClick={() => handleVerifyPatient(activity.patient_id || 0)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                      >
                        Verify
                      </button>
                    ) : (
                      <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
                        View
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Patient Lookup</h3>
            <p className="mt-1 text-sm text-gray-500">Search for patient records and information</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Create Medical Record</h3>
            <p className="mt-1 text-sm text-gray-500">Document a new patient encounter or update records</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Schedule Management</h3>
            <p className="mt-1 text-sm text-gray-500">View and manage your appointment schedule</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Telemedicine Session</h3>
            <p className="mt-1 text-sm text-gray-500">Start or join a virtual appointment with a patient</p>
          </button>
          <button 
            onClick={handleEmergencyAccess}
            className="p-4 bg-red-50 border border-red-200 shadow rounded-lg hover:bg-red-100 text-left transition-colors"
          >
            <h3 className="text-lg font-medium text-red-900">Emergency Access</h3>
            <p className="mt-1 text-sm text-red-600">Initiate break-glass access for emergency situations</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Lab Results Review</h3>
            <p className="mt-1 text-sm text-gray-500">Review and process pending laboratory results</p>
          </button>
        </div>
      </div>
    </div>
  );
}