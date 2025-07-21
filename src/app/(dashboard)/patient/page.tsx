// src/app/(dashboard)/patient/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { PermissionBasedLayout } from '@/app/(dashboard)/_shared/layouts/PermissionBasedLayout';
import { HealthSummaryWidget } from './components/dashboard/HealthSummaryWidget';
import { MedicationAdherenceWidget } from './components/dashboard/MedicationAdherenceWidget';
import { RareDiseaseMonitoringWidget } from './components/dashboard/RareDiseaseMonitoringWidget';
import { AppointmentsWidget } from './components/dashboard/AppointmentsWidget';
import { VitalsWidget } from './components/dashboard/VitalsWidget';
import { SmartWatchDataWidget } from './components/dashboard/SmartWatchDataWidget';
import { ResearchParticipationWidget } from './components/dashboard/ResearchParticipationWidget';
import { CareTeamWidget } from './components/dashboard/CareTeamWidget';
import { HealthAlertsWidget } from './components/dashboard/HealthAlertsWidget';
import { QuickActionsWidget } from './components/dashboard/QuickActionsWidget';
import { useRouter } from 'next/navigation';

interface PatientDashboardData {
  patient_info: {
    name: string;
    email: string;
    has_rare_condition: boolean;
    rare_conditions: Array<{
      name: string;
      diagnosed_date: string;
      severity: 'mild' | 'moderate' | 'severe';
      specialist_provider?: string;
    }>;
  };
  health_summary: {
    overall_status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    last_checkup: string;
    next_appointment: string | null;
    identity_verified: boolean;
    days_until_verification_required: number | null;
  };
  medications: {
    active_medications: Array<{
      id: number;
      name: string;
      dosage: string;
      frequency: string;
      next_dose_time: string;
      adherence_rate: number;
      supply_days_left: number;
    }>;
    adherence_summary: {
      overall_rate: number;
      last_7_days: number;
      missed_doses_today: number;
      on_time_rate: number;
    };
    upcoming_refills: Array<{
      medication: string;
      days_remaining: number;
      auto_refill_enabled: boolean;
    }>;
  };
  vitals: {
    current: {
      blood_pressure?: string;
      heart_rate?: number;
      temperature?: number;
      weight?: number;
      oxygen_saturation?: number;
      pain_level?: number;
    };
    trends: {
      improving: string[];
      stable: string[];
      concerning: string[];
    };
    last_recorded: string;
  };
  wearable_data: {
    connected_devices: Array<{
      id: number;
      type: 'fitbit' | 'apple_watch' | 'garmin' | 'other';
      name: string;
      last_sync: string;
      battery_level?: number;
    }>;
    today_summary: {
      steps: number;
      heart_rate_avg: number;
      sleep_hours: number;
      active_minutes: number;
    };
    medication_reminders_sent: number;
  };
  appointments: {
    upcoming: Array<{
      id: number;
      date: string;
      time: string;
      provider_name: string;
      appointment_type: string;
      location: string;
      is_telemedicine: boolean;
      preparation_notes?: string;
    }>;
    recent: Array<{
      date: string;
      provider: string;
      summary: string;
      follow_up_required: boolean;
    }>;
  };
  care_team: Array<{
    id: number;
    name: string;
    role: string;
    specialty?: string;
    contact_method: string;
    last_contact: string;
    next_scheduled_contact?: string;
  }>;
  research_participation: {
    enrolled_studies: Array<{
      id: number;
      title: string;
      phase: string;
      enrollment_date: string;
      next_visit_date?: string;
      compensation_earned: number;
    }>;
    available_studies: Array<{
      id: number;
      title: string;
      description: string;
      estimated_time_commitment: string;
      compensation: string;
      eligibility_match: number; // percentage
    }>;
    data_contributions: {
      total_surveys_completed: number;
      wearable_data_shared_days: number;
      clinical_visits_completed: number;
    };
  };
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
  quick_actions: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    href: string;
    priority: 'high' | 'medium' | 'low';
    requires_verification?: boolean;
  }>;
}

export default function PatientDashboardPage() {
  const { user, getUserRole, hasPermission } = useAuth();
  const [dashboardData, setDashboardData] = useState<PatientDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const router = useRouter();

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the unified dashboard endpoint
      const response = await fetch('/api/patient/dashboard/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Dashboard fetch failed: ${response.status}`);
      }

      const data = await response.json();
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up periodic refresh for critical data (every 5 minutes)
    const refreshInterval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Auto-refresh on focus (when user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (lastUpdated && Date.now() - lastUpdated.getTime() > 2 * 60 * 1000) {
        fetchDashboardData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [lastUpdated]);

  // Role validation
  const userRole = getUserRole();
  if (userRole !== 'patient') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Patient Dashboard Access</h1>
            <p className="text-gray-700 mb-2">
              This dashboard is designed for patients only.
            </p>
            <p className="text-sm text-gray-500">
              Current role: {userRole} | User: {user?.email}
            </p>
          </div>
          <a
            href={`/dashboard/${userRole}`}
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Your Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Header actions with real-time alerts
  const headerActions = dashboardData && (
    <div className="flex items-center space-x-4">
      {/* Medication Reminders */}
      {dashboardData.medications.adherence_summary.missed_doses_today > 0 && (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {dashboardData.medications.adherence_summary.missed_doses_today} missed dose(s) today
        </div>
      )}

      {/* Upcoming Appointments */}
      {dashboardData.appointments.upcoming.length > 0 && (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          Next: {new Date(dashboardData.appointments.upcoming[0].date).toLocaleDateString()}
        </div>
      )}

      {/* Critical Health Alerts */}
      {dashboardData.alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length > 0 && (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 animate-pulse">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Critical Alert
        </div>
      )}

      {/* Identity Verification Warning */}
      {!dashboardData.health_summary.identity_verified && (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
          </svg>
          Identity verification required
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={fetchDashboardData}
        disabled={isLoading}
        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
      >
        <svg className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {isLoading ? 'Updating...' : 'Refresh'}
      </button>
    </div>
  );

  return (
    <PermissionBasedLayout
      title="Patient Dashboard"
      headerActions={headerActions}
    >
      <div className="space-y-6">
        {/* Loading State */}
        {isLoading && !dashboardData && (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-red-800 mb-2">Dashboard Loading Error</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={fetchDashboardData}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Dashboard Content */}
        {dashboardData && (
          <>
            {/* Critical Alerts - Always at top */}
            <HealthAlertsWidget 
              alerts={dashboardData.alerts.filter(a => a.severity === 'critical' || a.severity === 'high')}
              onAcknowledge={(alertId) => {
                setDashboardData(prev => prev ? {
                  ...prev,
                  alerts: prev.alerts.map(alert => 
                    alert.id === alertId ? { ...alert, acknowledged: true } : alert
                  )
                } : null);
              }}
            />

            {/* Welcome Section with Health Status */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    Welcome back, {dashboardData.patient_info.name}!
                  </h1>
                  <p className="text-blue-100 mb-4">
                    Here's your health overview and important updates.
                  </p>
                  
                  {/* Health Status Indicator */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        dashboardData.health_summary.overall_status === 'excellent' ? 'bg-green-400' :
                        dashboardData.health_summary.overall_status === 'good' ? 'bg-green-300' :
                        dashboardData.health_summary.overall_status === 'fair' ? 'bg-yellow-300' :
                        dashboardData.health_summary.overall_status === 'poor' ? 'bg-orange-300' :
                        'bg-red-400'
                      }`}></div>
                      <span className="text-sm">
                        Overall Status: {dashboardData.health_summary.overall_status.charAt(0).toUpperCase() + dashboardData.health_summary.overall_status.slice(1)}
                      </span>
                    </div>
                    
                    {dashboardData.patient_info.has_rare_condition && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">
                          Rare Disease Patient
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="text-right">
                  <p className="text-sm text-blue-100 mb-2">Last updated:</p>
                  <p className="text-sm font-medium">
                    {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Just now'}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Column 1: Health & Medications */}
              <div className="space-y-6">
                <HealthSummaryWidget healthSummary={dashboardData.health_summary} />
                <MedicationAdherenceWidget 
                  medications={dashboardData.medications}
                  onLogMedication={(medicationId) => {
                    // Handle medication logging
                    console.log('Log medication:', medicationId);
                  }}
                />
                {dashboardData.patient_info.has_rare_condition && (
                  <RareDiseaseMonitoringWidget 
                    rareConditions={dashboardData.patient_info.rare_conditions}
                    vitals={dashboardData.vitals}
                  />
                )}
              </div>

              {/* Column 2: Appointments & Care Team */}
              <div className="space-y-6">
                <AppointmentsWidget
                  appointments={dashboardData.appointments}
                  onScheduleAppointment={() => {
                    router.push('/patient/appointments/schedule');
                  }}
                />
                <CareTeamWidget 
                  careTeam={dashboardData.care_team}
                  onContactProvider={(providerId) => {
                    // Handle provider contact
                    console.log('Contact provider:', providerId);
                  }}
                />
                <VitalsWidget 
                  vitals={dashboardData.vitals}
                  onRecordVitals={() => {
                    router.push('/patient/vitals/record');
                  }}
                />
              </div>

              {/* Column 3: Technology & Research */}
              <div className="space-y-6">
                <SmartWatchDataWidget 
                  wearableData={dashboardData.wearable_data}
                  onConnectDevice={() => {
                    router.push('/patient/devices/connect');
                  }}
                />
                <ResearchParticipationWidget 
                  researchData={dashboardData.research_participation}
                  onJoinStudy={(studyId) => {
                    router.push(`/patient/research/studies/${studyId}`);
                  }}
                />
                <QuickActionsWidget 
                  actions={dashboardData.quick_actions}
                  identityVerified={dashboardData.health_summary.identity_verified}
                />
              </div>
            </div>

            {/* Identity Verification Notice */}
            {!dashboardData.health_summary.identity_verified && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-orange-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-medium text-orange-800 mb-2">Identity Verification Required</h3>
                    <p className="text-orange-700 mb-4">
                      To ensure security and compliance with healthcare regulations, please complete identity verification.
                      {dashboardData.health_summary.days_until_verification_required && (
                        <span className="font-medium">
                          {' '}You have {dashboardData.health_summary.days_until_verification_required} days remaining.
                        </span>
                      )}
                    </p>
                    <a
                      href="/patient/profile/verify-identity"
                      className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                    >
                      Complete Verification
                    </a>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PermissionBasedLayout>
  );
}