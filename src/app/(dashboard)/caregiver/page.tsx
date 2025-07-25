// src/app/(dashboard)/caregiver/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Spinner } from '@/components/ui/spinner';

interface CaregiverStats {
  authorized_patients: number;
  upcoming_appointments: number;
  medications_to_administer: number;
  pending_messages: number;
  pending_requests: number;
  access_level: 'VIEW_ONLY' | 'SCHEDULE' | 'MEDICATIONS' | 'FULL';
  is_primary_caregiver: boolean;
}

interface AuthorizedPatient {
  id: number;
  name: string;
  email: string;
  access_level: 'VIEW_ONLY' | 'SCHEDULE' | 'MEDICATIONS' | 'FULL';
  authorized_at: string;
  relationship: string;
}

interface Activity {
  id: number;
  type: 'appointment' | 'medication' | 'message' | 'authorization' | 'health_update' | 'emergency';
  description: string;
  date: string;
  priority?: 'high' | 'medium' | 'low';
  patient_id?: number;
  requires_action?: boolean;
}

export default function CaregiverDashboard() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<CaregiverStats | null>(null);
  const [authorizedPatients, setAuthorizedPatients] = useState<AuthorizedPatient[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (user?.role === 'caregiver') {
      fetchCaregiverData();
    }
  }, [user]);

  const fetchCaregiverData = async () => {
    // In real implementation, this would call caregiver-specific APIs
    setTimeout(() => {
      const mockStats: CaregiverStats = {
        authorized_patients: 2,
        upcoming_appointments: 3,
        medications_to_administer: 8,
        pending_messages: 2,
        pending_requests: 1,
        access_level: 'FULL',
        is_primary_caregiver: true
      };

      const mockPatients: AuthorizedPatient[] = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          access_level: 'FULL',
          authorized_at: '2024-01-01',
          relationship: 'SPOUSE'
        },
        {
          id: 2,
          name: 'Mary Smith',
          email: 'mary@example.com',
          access_level: 'MEDICATIONS',
          authorized_at: '2024-01-10',
          relationship: 'PARENT'
        }
      ];

      const mockActivities: Activity[] = [
        {
          id: 1,
          type: 'medication',
          description: 'Morning medications due for John Doe - Rituximab infusion',
          date: '2024-01-15',
          priority: 'high',
          patient_id: 1,
          requires_action: true
        },
        {
          id: 2,
          type: 'appointment',
          description: 'Upcoming neurology appointment for Mary Smith tomorrow',
          date: '2024-01-20',
          priority: 'medium',
          patient_id: 2,
          requires_action: false
        },
        {
          id: 3,
          type: 'authorization',
          description: 'New caregiver authorization request pending from Sarah Johnson',
          date: '2024-01-18',
          priority: 'medium',
          requires_action: true
        },
        {
          id: 4,
          type: 'health_update',
          description: 'New lab results available for John Doe',
          date: '2024-01-17',
          priority: 'medium',
          patient_id: 1,
          requires_action: false
        },
        {
          id: 5,
          type: 'message',
          description: 'Message from Dr. Wilson regarding Mary\'s treatment plan',
          date: '2024-01-16',
          priority: 'medium',
          patient_id: 2,
          requires_action: false
        }
      ];

      setStats(mockStats);
      setAuthorizedPatients(mockPatients);
      setActivities(mockActivities);
    }, 500);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${greeting}, ${user?.first_name || 'Caregiver'}`;
  };

  const getAccessLevelDisplay = (level: string) => {
    switch (level) {
      case 'VIEW_ONLY': return 'View Only';
      case 'SCHEDULE': return 'View & Schedule';
      case 'MEDICATIONS': return 'View & Medications';
      case 'FULL': return 'Full Access';
      default: return level;
    }
  };

  const canAccessFeature = (feature: string, accessLevel: string) => {
    const permissions = {
      'VIEW_ONLY': ['view'],
      'SCHEDULE': ['view', 'schedule'],
      'MEDICATIONS': ['view', 'medications'],
      'FULL': ['view', 'schedule', 'medications', 'edit']
    };
    return permissions[accessLevel as keyof typeof permissions]?.includes(feature) || false;
  };

  const handleEmergencyContact = () => {
  };

  if (isLoading || !user || user.role !== 'caregiver') {
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
        <p className="text-lg text-gray-600">Caregiver Dashboard</p>
      </div>

      {stats && (
        <>
          {/* Access Level Status */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blue-800">Your Access Level</h3>
                <p className="text-lg font-semibold text-blue-900">{getAccessLevelDisplay(stats.access_level)}</p>
                {stats.is_primary_caregiver && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mt-1">
                    Primary Caregiver
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600">Authorized for {stats.authorized_patients} patient(s)</p>
              </div>
            </div>
          </div>

          {/* Care Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Care Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Authorized Patients</p>
                <p className="mt-1 text-3xl font-semibold text-blue-600">{stats.authorized_patients}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Upcoming Appointments</p>
                <p className="mt-1 text-3xl font-semibold text-green-600">{stats.upcoming_appointments}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Medications Due</p>
                <p className="mt-1 text-3xl font-semibold text-orange-600">{stats.medications_to_administer}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500">Pending Messages</p>
                <p className="mt-1 text-3xl font-semibold text-purple-600">{stats.pending_messages}</p>
              </div>
            </div>
          </div>

          {/* Authorized Patients */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Patients</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {authorizedPatients.map((patient) => (
                <div key={patient.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">{patient.name}</h3>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      {getAccessLevelDisplay(patient.access_level)}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Relationship:</span> {patient.relationship}</p>
                    <p><span className="font-medium">Authorized since:</span> {patient.authorized_at}</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button 
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                    >
                      View Profile
                    </button>
                    {canAccessFeature('medications', patient.access_level) && (
                      <button 
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200"
                      >
                        Medications
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Care Activity</h2>
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
                       activity.type === 'medication' ? '💊' :
                       activity.type === 'message' ? '💬' :
                       activity.type === 'authorization' ? '🔐' :
                       activity.type === 'health_update' ? '📋' :
                       activity.type === 'emergency' ? '🚨' : '👥'}
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
                      {activity.type === 'medication' ? 'Manage' :
                       activity.type === 'appointment' ? 'View' :
                       activity.type === 'authorization' ? 'Review' :
                       activity.type === 'emergency' ? 'Respond' :
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
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Caregiver Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Patient Health Records</h3>
            <p className="mt-1 text-sm text-gray-500">View health information for your patients</p>
          </button>
          <button 
            className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <h3 className="text-lg font-medium text-gray-900">Medication Management</h3>
            <p className="mt-1 text-sm text-gray-500">Track and manage patient medications</p>
          </button>
          <button 
            className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors"
          >
            <h3 className="text-lg font-medium text-gray-900">Appointment Scheduling</h3>
            <p className="mt-1 text-sm text-gray-500">Schedule and manage medical appointments</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Care Coordination</h3>
            <p className="mt-1 text-sm text-gray-500">Coordinate care between providers</p>
          </button>
          <button 
            onClick={handleEmergencyContact}
            className="p-4 bg-red-50 border border-red-200 shadow rounded-lg hover:bg-red-100 text-left transition-colors"
          >
            <h3 className="text-lg font-medium text-red-900">Emergency Contacts</h3>
            <p className="mt-1 text-sm text-red-600">Quick access to emergency contacts and procedures</p>
          </button>
          <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h3 className="text-lg font-medium text-gray-900">Care Notes</h3>
            <p className="mt-1 text-sm text-gray-500">Document care activities and observations</p>
          </button>
        </div>
      </div>
    </div>
  );
}