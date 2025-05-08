// src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/use-auth';
import { UserRole } from '@/types/auth.types';
import { Spinner } from '@/components/ui/spinner';

/**
 * Dashboard page component that adapts to user role.
 * 
 * This component provides a personalized dashboard experience based on the user's role,
 * displaying different information and functionality for patients, providers, researchers, etc.
 */
export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    // In a real application, this would fetch data from the API
    // based on the user's role and permissions
    if (user) {
      // Simulate API call with mock data based on user role
      setTimeout(() => {
        setStats(getMockStats(user.role));
        setActivities(getMockActivities(user.role));
      }, 500);
    }
  }, [user]);

  // Get mock statistics based on user role
  const getMockStats = (role?: UserRole) => {
    switch (role) {
      case 'patient':
        return {
          upcoming_appointments: 2,
          prescriptions: 3,
          pending_messages: 1,
          last_checkup: '2023-12-15',
        };
      case 'provider':
        return {
          todays_appointments: 8,
          pending_messages: 5,
          pending_lab_results: 3,
          patients_seen_this_week: 22,
        };
      case 'researcher':
        return {
          active_studies: 3,
          enrolled_subjects: 145,
          data_points_collected: 12850,
          pending_analyses: 2,
        };
      case 'pharmco':
        return {
          active_medications: 12,
          clinical_trials: 5,
          adverse_events: 2,
          new_prescriptions: 87,
        };
      case 'caregiver':
        return {
          patients: 2,
          upcoming_appointments: 3,
          medications_to_administer: 8,
          pending_messages: 2,
        };
      case 'compliance':
      case 'admin':
      case 'superadmin':
        return {
          pending_approvals: 7,
          system_alerts: 2,
          audit_logs_today: 156,
          active_users: 328,
        };
      default:
        return {
          notifications: 3,
          messages: 5,
          tasks: 2,
        };
    }
  };

  // Get mock activities based on user role
  const getMockActivities = (role?: UserRole) => {
    switch (role) {
      case 'patient':
        return [
          { id: 1, type: 'appointment', description: 'Annual checkup with Dr. Smith', date: '2023-12-20' },
          { id: 2, type: 'prescription', description: 'Prescription for Lisinopril was renewed', date: '2023-12-15' },
          { id: 3, type: 'message', description: 'Message from Dr. Smith about your lab results', date: '2023-12-12' },
        ];
      case 'provider':
        return [
          { id: 1, type: 'patient', description: 'New patient registered: John Doe', date: '2023-12-18' },
          { id: 2, type: 'appointment', description: 'Appointment scheduled with Jane Smith', date: '2023-12-20' },
          { id: 3, type: 'lab', description: 'Lab results received for patient #12345', date: '2023-12-17' },
          { id: 4, type: 'message', description: '5 new patient messages pending review', date: '2023-12-19' },
        ];
      default:
        return [
          { id: 1, type: 'notification', description: 'System update scheduled for maintenance', date: '2023-12-22' },
          { id: 2, type: 'message', description: 'New message from system administrator', date: '2023-12-19' },
          { id: 3, type: 'task', description: 'Complete profile information', date: '2023-12-15' },
        ];
    }
  };

  // Generate title based on user role and time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 12) {
      greeting = 'Good morning';
    } else if (hour < 18) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }
    
    return `${greeting}, ${user?.first_name || 'User'}`;
  };

  // Get role-specific title for the dashboard
  const getRoleTitle = (role?: UserRole) => {
    switch (role) {
      case 'patient':
        return 'Patient Dashboard';
      case 'provider':
        return 'Provider Dashboard';
      case 'researcher':
        return 'Researcher Dashboard';
      case 'pharmco':
        return 'Pharmaceutical Dashboard';
      case 'caregiver':
        return 'Caregiver Dashboard';
      case 'compliance':
        return 'Compliance Dashboard';
      case 'admin':
      case 'superadmin':
        return 'Admin Dashboard';
      default:
        return 'Dashboard';
    }
  };

  // If loading or no user, show spinner
  if (isLoading || !user) {
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
        <p className="text-lg text-gray-600">{getRoleTitle(user.role)}</p>
      </div>

      {stats && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <li key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <span className="inline-block h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        {activity.type[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.description}</p>
                      <p className="text-sm text-gray-500 truncate">{activity.date}</p>
                    </div>
                    <div>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-gray-500">No recent activities</li>
            )}
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {user.role === 'patient' && (
            <>
              <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left">
                <h3 className="text-lg font-medium text-gray-900">Schedule Appointment</h3>
                <p className="mt-1 text-sm text-gray-500">Book a new appointment with your healthcare provider</p>
              </button>
              <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left">
                <h3 className="text-lg font-medium text-gray-900">View Medical Records</h3>
                <p className="mt-1 text-sm text-gray-500">Access your health information and test results</p>
              </button>
              <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left">
                <h3 className="text-lg font-medium text-gray-900">Request Prescription Refill</h3>
                <p className="mt-1 text-sm text-gray-500">Request a refill for your current medications</p>
              </button>
            </>
          )}

          {user.role === 'provider' && (
            <>
              <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left">
                <h3 className="text-lg font-medium text-gray-900">Patient Lookup</h3>
                <p className="mt-1 text-sm text-gray-500">Search for patient records and information</p>
              </button>
              <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left">
                <h3 className="text-lg font-medium text-gray-900">Create Medical Record</h3>
                <p className="mt-1 text-sm text-gray-500">Document a new patient encounter or update records</p>
              </button>
              <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left">
                <h3 className="text-lg font-medium text-gray-900">Telemedicine Session</h3>
                <p className="mt-1 text-sm text-gray-500">Start or join a virtual appointment with a patient</p>
              </button>
            </>
          )}

          {user.role === 'researcher' && (
            <>
              <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left">
                <h3 className="text-lg font-medium text-gray-900">Research Data Access</h3>
                <p className="mt-1 text-sm text-gray-500">Access de-identified data for your approved studies</p>
              </button>
              <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left">
                <h3 className="text-lg font-medium text-gray-900">Study Management</h3>
                <p className="mt-1 text-sm text-gray-500">Manage your current research studies and participants</p>
              </button>
              <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left">
                <h3 className="text-lg font-medium text-gray-900">Analytics Tools</h3>
                <p className="mt-1 text-sm text-gray-500">Access statistical analysis tools for research data</p>
              </button>
            </>
          )}

          {(user.role === 'admin' || user.role === 'superadmin') && (
            <>
              <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left">
                <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                <p className="mt-1 text-sm text-gray-500">Manage users, permissions, and account statuses</p>
              </button>
              <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left">
                <h3 className="text-lg font-medium text-gray-900">Approval Queue</h3>
                <p className="mt-1 text-sm text-gray-500">Review and approve pending user registrations</p>
              </button>
              <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left">
                <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
                <p className="mt-1 text-sm text-gray-500">Configure platform settings and preferences</p>
              </button>
            </>
          )}

          {/* Fallback actions for other roles */}
          {!['patient', 'provider', 'researcher', 'admin', 'superadmin'].includes(user.role || '') && (
            <>
              <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left">
                <h3 className="text-lg font-medium text-gray-900">View Profile</h3>
                <p className="mt-1 text-sm text-gray-500">Review and update your profile information</p>
              </button>
              <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left">
                <h3 className="text-lg font-medium text-gray-900">Messages</h3>
                <p className="mt-1 text-sm text-gray-500">View and respond to your messages</p>
              </button>
              <button className="p-4 bg-white shadow rounded-lg hover:bg-gray-50 text-left">
                <h3 className="text-lg font-medium text-gray-900">Help & Support</h3>
                <p className="mt-1 text-sm text-gray-500">Get assistance with using the platform</p>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}