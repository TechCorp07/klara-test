// src/app/(dashboard)/patient/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import { Spinner } from '@/components/ui/spinner';

interface PatientStats {
  upcoming_appointments: number;
  prescriptions: number;
  pending_messages: number;
  last_checkup: string;
  identity_verified: boolean;
  days_until_verification_required: number | null;
  medication_adherence_consent: boolean;
  research_participation_consent: boolean;
  pending_caregiver_requests: number;
}

interface Activity {
  id: number;
  type: 'appointment' | 'prescription' | 'message' | 'verification' | 'caregiver';
  description: string;
  date: string;
  priority?: 'high' | 'medium' | 'low';
}

export default function PatientDashboard() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);

  useEffect(() => {
    if (user?.role === 'patient') {
      fetchPatientData();
    }
  }, [user]);

  const fetchPatientData = async () => {
    // Simulate API call - replace with actual API calls
    setTimeout(() => {
      const mockStats: PatientStats = {
        upcoming_appointments: 2,
        prescriptions: 3,
        pending_messages: 1,
        last_checkup: '2023-12-15',
        identity_verified: false,
        days_until_verification_required: 5,
        medication_adherence_consent: true,
        research_participation_consent: false,
        pending_caregiver_requests: 1
      };

      const mockActivities: Activity[] = [
        {
          id: 1,
          type: 'verification',
          description: 'Identity verification required - 5 days remaining',
          date: '2024-01-15',
          priority: 'high'
        },
        {
          id: 2,
          type: 'appointment',
          description: 'Annual checkup with Dr. Smith scheduled',
          date: '2024-01-20',
          priority: 'medium'
        },
        {
          id: 3,
          type: 'prescription',
          description: 'Prescription for Lisinopril was renewed',
          date: '2024-01-10',
          priority: 'low'
        },
        {
          id: 4,
          type: 'caregiver',
          description: 'New caregiver authorization request from Jane Smith',
          date: '2024-01-12',
          priority: 'medium'
        }
      ];

      setStats(mockStats);
      setActivities(mockActivities);
      
      if (!mockStats.identity_verified && mockStats.days_until_verification_required !== null && mockStats.days_until_verification_required <= 7) {
        setShowVerificationAlert(true);
      }
    }, 500);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${user?.first_name || 'Patient'}`;
  };

  const handleVerifyIdentity = () => {
    console.log('Starting identity verification process...');
  };

  const handleCaregiverRequest = (action: 'approve' | 'deny', requestId: number) => {
    console.log(`${action} caregiver request ${requestId}`);
  };

  if (isLoading || !user || user.role !== 'patient') {
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
        <p className="text-lg text-gray-600">Your Health Dashboard</p>
      </div>

      {showVerificationAlert && stats && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">Action Required: Identity Verification</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Please verify your identity within {stats.days_until_verification_required} days to continue using your account.</p>
              </div>
              <div className="mt-4">
                <button onClick={handleVerifyIdentity} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Verify Identity Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {stats && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Health Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm font-medium text-gray-500">Upcoming Appointments</p>
              <p className="mt-1 text-3xl font-semibold text-blue-600">{stats.upcoming_appointments}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm font-medium text-gray-500">Active Prescriptions</p>
              <p className="mt-1 text-3xl font-semibold text-green-600">{stats.prescriptions}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm font-medium text-gray-500">Pending Messages</p>
              <p className="mt-1 text-3xl font-semibold text-orange-600">{stats.pending_messages}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm font-medium text-gray-500">Last Checkup</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">{stats.last_checkup}</p>
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
                      {activity.type === 'appointment' ? '📅' :
                       activity.type === 'prescription' ? '💊' :
                       activity.type === 'message' ? '💬' :
                       activity.type === 'verification' ? '🔒' :
                       activity.type === 'caregiver' ? '👥' : '📋'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-500">{activity.date}</p>
                  </div>
                  <div>
                    {activity.type === 'caregiver' ? (
                      <div className="flex space-x-2">
                        <button onClick={() => handleCaregiverRequest('approve', activity.id)} className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200">
                          Approve
                        </button>
                        <button onClick={() => handleCaregiverRequest('deny', activity.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200">
                          Deny
                        </button>
                      </div>
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
            <h3 className="text-lg font-medium text-gray-900">Schedule Appointment</h3>
            <p className="mt-1 text-sm text-gray-500">Book a new appointment with your healthcare provider</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">View Medical Records</h3>
            <p className="mt-1 text-sm text-gray-500">Access your health information and test results</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Medication Management</h3>
            <p className="mt-1 text-sm text-gray-500">Track medications and request refills</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Telemedicine</h3>
            <p className="mt-1 text-sm text-gray-500">Join virtual appointments with your doctor</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Research Participation</h3>
            <p className="mt-1 text-sm text-gray-500">Manage your research study participation</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Privacy Settings</h3>
            <p className="mt-1 text-sm text-gray-500">Manage your consent preferences and data sharing</p>
          </button>
        </div>
      </div>
    </div>
  );
}