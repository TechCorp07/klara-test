// src/app/(dashboard)/patient/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/lib/api/client';
import { Spinner } from '@/components/ui/spinner';
import { HealthSummaryCard } from './components/HealthSummaryCard';
import { AppointmentCard } from './components/AppointmentCard';
import { MedicationTracker } from './components/MedicationTracker';
import { HealthRecordsAccess } from './components/HealthRecordsAccess';

interface PatientDashboardData {
  health_summary: {
    recent_vitals: {
      blood_pressure?: string;
      heart_rate?: number;
      temperature?: number;
      weight?: number;
      last_updated: string;
    };
    active_conditions: Array<{
      id: number;
      name: string;
      severity: 'low' | 'moderate' | 'severe';
      diagnosed_date: string;
    }>;
    upcoming_appointments_count: number;
    medication_adherence_rate: number;
  };
  quick_actions: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    href: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  recent_activities: Array<{
    id: number;
    type: 'appointment' | 'medication' | 'test_result' | 'message';
    title: string;
    description: string;
    date: string;
    status?: string;
  }>;
  profile_complete?: boolean;
  identity_verified?: boolean;
  days_until_verification_required?: number;
}

export default function PatientDashboard() {
  const { user, isInitialized, isAuthReady } = useAuth();
  const [dashboardData, setDashboardData] = useState<PatientDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Single, clean fetch function that only runs when auth is fully ready
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('👤 Fetching patient dashboard data for user:', user?.id);
        
        // Make the API call - auth system has verified cookies are working
        const response = await apiClient.get('/patient/dashboard/');
        setDashboardData(response.data);
        
        console.log('✅ Dashboard data loaded successfully');
      } catch (err: any) {
        console.error('❌ Dashboard fetch error:', err);
        
        // Handle specific error cases - these should be rare now
        if (err.response?.status === 403) {
          setError('You do not have permission to access this dashboard.');
        } else if (err.response?.status === 404) {
          setError('Dashboard data not found. Please complete your profile.');
        } else {
          setError(err.message || 'Failed to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    // CRITICAL: Only fetch when ALL conditions are met
    const shouldFetch = (
      isInitialized &&          // Auth system is initialized
      isAuthReady &&            // Authentication has been verified working
      user &&                   // User object exists
      user.role === 'patient' && // User is a patient
      user.id                   // User has an ID
    );

    if (shouldFetch) {
      console.log('🚀 All auth conditions met, starting dashboard fetch...');
      fetchDashboardData();
    } else {
      console.log('⏳ Waiting for auth to be fully ready...', {
        isInitialized,
        isAuthReady,
        hasUser: !!user,
        isPatient: user?.role === 'patient',
        hasUserId: !!user?.id
      });
      
      // Handle specific waiting states
      if (isInitialized && user && user.role !== 'patient') {
        setError('This dashboard is only accessible to patients.');
        setLoading(false);
      } else if (isInitialized && !user) {
        setError('Please log in to access your dashboard.');
        setLoading(false);
      }
    }
  }, [isInitialized, isAuthReady, user]);

  // Show appropriate loading states
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Initializing...</span>
      </div>
    );
  }

  if (isInitialized && !isAuthReady && user) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Verifying your session...</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Loading your dashboard...</span>
      </div>
    );
  }

  // Check permissions
  const canViewDashboard = user && user.role === 'patient';
  
  if (!canViewDashboard && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Access Denied
          </h3>
          <p className="text-red-700">
            You do not have permission to view this dashboard. Please contact support if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Unable to Load Dashboard
          </h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Profile completion warning
  const showProfileWarning = dashboardData && !dashboardData.profile_complete;
  const showVerificationWarning = dashboardData && !dashboardData.identity_verified && 
    dashboardData.days_until_verification_required !== undefined && 
    dashboardData.days_until_verification_required <= 7;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name || 'Patient'}
        </h1>
        <p className="mt-2 text-gray-600">
          Here's an overview of your health information and upcoming activities.
        </p>
      </div>

      {/* Warnings */}
      {showProfileWarning && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Profile Incomplete
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Please complete your profile to access all features.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVerificationWarning && (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                Identity Verification Required
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>
                  You have {dashboardData?.days_until_verification_required} days to complete identity verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Health Summary */}
          {dashboardData?.health_summary && (
            <HealthSummaryCard data={dashboardData.health_summary} />
          )}

          {/* Recent Activities */}
          {dashboardData?.recent_activities && dashboardData.recent_activities.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
              <div className="space-y-3">
                {dashboardData.recent_activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                    </div>
                    {activity.status && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {activity.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {dashboardData?.quick_actions && dashboardData.quick_actions.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                {dashboardData.quick_actions.map((action) => (
                  <a
                    key={action.id}
                    href={action.href}
                    className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <p className="text-sm font-medium text-blue-900">{action.title}</p>
                    <p className="text-xs text-blue-700">{action.description}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Additional Components */}
          <AppointmentCard />
          <MedicationTracker />
          <HealthRecordsAccess />
        </div>
      </div>
    </div>
  );
}