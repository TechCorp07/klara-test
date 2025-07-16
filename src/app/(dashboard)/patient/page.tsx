// src/app/(dashboard)/patient/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { PermissionGate } from '@/components/permissions/PermissionGate';
import { PermissionBasedLayout } from '@/app/(dashboard)/_shared/layouts/PermissionBasedLayout';
import { PermissionAwareDashboard } from '@/components/dashboard/PermissionAwareDashboard';

interface PatientDashboardData {
  health_summary: {
    overall_status: 'excellent' | 'good' | 'fair' | 'poor';
    last_checkup: string;
    next_appointment: string | null;
    vital_signs_current: {
      blood_pressure: string;
      heart_rate: number;
      temperature: number;
      weight: number;
    };
  };
  medications: {
    active_count: number;
    due_today: number;
    missed_doses: number;
    upcoming_refills: Array<{
      name: string;
      days_remaining: number;
    }>;
  };
  appointments: {
    upcoming_count: number;
    next_appointment: {
      date: string;
      provider: string;
      type: string;
    } | null;
    recent_visits: Array<{
      date: string;
      provider: string;
      summary: string;
    }>;
  };
  health_records: {
    recent_tests: Array<{
      test_name: string;
      date: string;
      status: 'normal' | 'abnormal' | 'pending';
    }>;
    documents_count: number;
    alerts: Array<{
      message: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  };
  research_participation: {
    enrolled_studies: number;
    completed_surveys: number;
    upcoming_visits: number;
  };
}

/**
 * Phase 2: Permission-Based Patient Dashboard
 * Shows how patient-specific features adapt based on permissions
 */
export default function PatientDashboardPage() {
  const { hasPermission, user, getUserRole } = useAuth();
  const [dashboardData, setDashboardData] = useState<PatientDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatientDashboardData();
  }, []);

  const fetchPatientDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API call - in production, this would fetch from your backend
      const mockData: PatientDashboardData = {
        health_summary: {
          overall_status: 'good',
          last_checkup: '2025-01-10',
          next_appointment: '2025-01-25',
          vital_signs_current: {
            blood_pressure: '120/80',
            heart_rate: 72,
            temperature: 98.6,
            weight: 165
          }
        },
        medications: {
          active_count: 3,
          due_today: 1,
          missed_doses: 0,
          upcoming_refills: [
            { name: 'Metformin', days_remaining: 7 },
            { name: 'Lisinopril', days_remaining: 12 }
          ]
        },
        appointments: {
          upcoming_count: 2,
          next_appointment: {
            date: '2025-01-25T10:00:00Z',
            provider: 'Dr. Smith',
            type: 'Regular Checkup'
          },
          recent_visits: [
            {
              date: '2025-01-10',
              provider: 'Dr. Smith',
              summary: 'Regular checkup - all vitals normal'
            }
          ]
        },
        health_records: {
          recent_tests: [
            {
              test_name: 'Blood Panel',
              date: '2025-01-10',
              status: 'normal'
            },
            {
              test_name: 'X-Ray',
              date: '2025-01-08',
              status: 'pending'
            }
          ],
          documents_count: 15,
          alerts: [
            {
              message: 'Annual physical due soon',
              severity: 'low'
            }
          ]
        },
        research_participation: {
          enrolled_studies: 1,
          completed_surveys: 3,
          upcoming_visits: 1
        }
      };

      setDashboardData(mockData);
    } catch (err) {
      setError('Failed to load patient dashboard data');
      console.error('Patient dashboard error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Custom patient-specific widgets
  const patientWidgets = [
    {
      id: 'health-summary',
      title: 'Health Summary',
      size: 'large' as const,
      priority: 1,
      content: (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Overview</h3>
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-6 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Overall Status</p>
                <p className={`text-lg font-semibold ${
                  dashboardData?.health_summary.overall_status === 'excellent' ? 'text-green-600' :
                  dashboardData?.health_summary.overall_status === 'good' ? 'text-blue-600' :
                  dashboardData?.health_summary.overall_status === 'fair' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {dashboardData?.health_summary.overall_status?.toUpperCase() || 'UNKNOWN'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Blood Pressure</p>
                <p className="text-lg font-semibold text-blue-600">
                  {dashboardData?.health_summary.vital_signs_current.blood_pressure || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Heart Rate</p>
                <p className="text-lg font-semibold text-green-600">
                  {dashboardData?.health_summary.vital_signs_current.heart_rate || 'N/A'} bpm
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Weight</p>
                <p className="text-lg font-semibold text-purple-600">
                  {dashboardData?.health_summary.vital_signs_current.weight || 'N/A'} lbs
                </p>
              </div>
            </div>
          )}
        </div>
      )
    },

    {
      id: 'medications-tracker',
      title: 'Medication Tracker',
      size: 'medium' as const,
      priority: 2,
      content: (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Medications</h3>
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-6 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Medications</span>
                <span className="font-semibold text-blue-600">
                  {dashboardData?.medications.active_count || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Due Today</span>
                <span className={`font-semibold ${
                  (dashboardData?.medications.due_today || 0) > 0 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {dashboardData?.medications.due_today || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Missed Doses</span>
                <span className={`font-semibold ${
                  (dashboardData?.medications.missed_doses || 0) > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {dashboardData?.medications.missed_doses || 0}
                </span>
              </div>
              {dashboardData?.medications.upcoming_refills.length ? (
                <div className="mt-4 pt-3 border-t">
                  <p className="text-sm font-medium text-gray-900 mb-2">Upcoming Refills</p>
                  {dashboardData.medications.upcoming_refills.map((refill, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {refill.name}: {refill.days_remaining} days
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
          <div className="mt-4">
            <a
              href="/patient/medications"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Manage Medications →
            </a>
          </div>
        </div>
      )
    },

    {
      id: 'appointments-overview',
      title: 'Appointments',
      size: 'medium' as const,
      priority: 3,
      content: (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointments</h3>
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-6 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData?.appointments.next_appointment ? (
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm font-medium text-blue-900">Next Appointment</p>
                  <p className="text-sm text-blue-800">
                    {new Date(dashboardData.appointments.next_appointment.date).toLocaleDateString()} at{' '}
                    {new Date(dashboardData.appointments.next_appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-sm text-blue-700">
                    {dashboardData.appointments.next_appointment.provider} - {dashboardData.appointments.next_appointment.type}
                  </p>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No upcoming appointments
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Upcoming</span>
                <span className="font-semibold text-blue-600">
                  {dashboardData?.appointments.upcoming_count || 0}
                </span>
              </div>
            </div>
          )}
          <div className="mt-4 space-y-2">
            <a
              href="/patient/appointments"
              className="block text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Appointments →
            </a>
            <a
              href="/patient/appointments/schedule"
              className="block text-sm text-green-600 hover:text-green-800 font-medium"
            >
              Schedule New Appointment →
            </a>
          </div>
        </div>
      )
    },

    // Research participation widget - only show if user has research permissions
    {
      id: 'research-participation',
      title: 'Research Participation',
      permission: 'can_access_research_data',
      size: 'medium' as const,
      priority: 4,
      content: (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Studies</h3>
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-6 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Enrolled Studies</span>
                <span className="font-semibold text-purple-600">
                  {dashboardData?.research_participation.enrolled_studies || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed Surveys</span>
                <span className="font-semibold text-green-600">
                  {dashboardData?.research_participation.completed_surveys || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Upcoming Visits</span>
                <span className="font-semibold text-orange-600">
                  {dashboardData?.research_participation.upcoming_visits || 0}
                </span>
              </div>
            </div>
          )}
          <div className="mt-4">
            <a
              href="/patient/research"
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              View Research Dashboard →
            </a>
          </div>
        </div>
      )
    }
  ];

  // Header actions specific to patient dashboard
  const headerActions = (
    <div className="flex items-center space-x-4">
      {dashboardData?.medications.due_today && dashboardData.medications.due_today > 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          {dashboardData.medications.due_today} medication(s) due
        </span>
      )}
      
      {dashboardData?.health_records.alerts.length && dashboardData.health_records.alerts.length > 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          {dashboardData.health_records.alerts.length} health alert(s)
        </span>
      )}
    </div>
  );

  // Check if user is a patient
  const userRole = getUserRole();
  if (userRole !== 'patient') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Patient Dashboard Access</h1>
          <p className="text-gray-600 mb-4">
            This dashboard is designed for patients only.
          </p>
          <p className="text-sm text-gray-500">
            Current role: {userRole} | User: {user?.email}
          </p>
          <a
            href={`/${userRole}`}
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Your Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <PermissionBasedLayout
      title="Patient Dashboard"
      headerActions={headerActions}
    >
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.first_name || user?.username}!
          </h1>
          <p className="text-blue-100">
            Here's your health overview and important updates.
          </p>
          {dashboardData?.health_summary.next_appointment && (
            <div className="mt-4 bg-blue-600 bg-opacity-50 rounded-md p-3">
              <p className="text-sm font-medium">Next Appointment</p>
              <p className="text-blue-100">
                {new Date(dashboardData.health_summary.next_appointment).toLocaleDateString()} - 
                Don't forget to prepare your questions!
              </p>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">Dashboard Error</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchPatientDashboardData}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Dashboard - Permission-Aware */}
        <PermissionAwareDashboard
          customWidgets={patientWidgets}
          showDefaultWidgets={false}
          layout="grid"
          maxColumns={3}
        />

        {/* Health Alerts Section */}
        {dashboardData?.health_records.alerts && dashboardData.health_records.alerts.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Alerts</h3>
            <div className="space-y-3">
              {dashboardData.health_records.alerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-md ${
                  alert.severity === 'high' ? 'bg-red-50 border border-red-200' :
                  alert.severity === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <p className={`text-sm font-medium ${
                    alert.severity === 'high' ? 'text-red-800' :
                    alert.severity === 'medium' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/patient/appointments/schedule"
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-blue-500"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="font-medium text-gray-900">Schedule Appointment</p>
                <p className="text-sm text-gray-600">Book your next visit</p>
              </div>
            </div>
          </a>

          <a
            href="/patient/health-records"
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-green-500"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏥</span>
              <div>
                <p className="font-medium text-gray-900">View Health Records</p>
                <p className="text-sm text-gray-600">Access your medical history</p>
              </div>
            </div>
          </a>

          <a
            href="/patient/medications"
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-purple-500"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💊</span>
              <div>
                <p className="font-medium text-gray-900">Manage Medications</p>
                <p className="text-sm text-gray-600">Track your prescriptions</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </PermissionBasedLayout>
  );
}