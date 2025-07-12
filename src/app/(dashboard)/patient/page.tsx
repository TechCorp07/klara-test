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
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<PatientDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use the API client with the correct endpoint
        // Note: apiClient already adds the /api/proxy prefix
        const response = await apiClient.get('/patient/dashboard/');
        setDashboardData(response.data);
      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
        
        // Handle specific error cases
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

    // Only fetch when we have a real authenticated patient user
    if (user && user.role === 'patient' && user.id) {
      console.log('👤 Fetching patient dashboard data for user:', user.id);
      fetchDashboardData();
    } else if (user && user.role !== 'patient') {
      setError('This dashboard is only accessible to patients.');
      setLoading(false);
    } else {
      console.log('⏳ Waiting for user authentication');
      setLoading(false);
    }
  }, [user]);

  // Check permissions - for now, allow all authenticated patients
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

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spinner size="lg" />
        <span className="ml-2 text-gray-600">Loading your dashboard...</span>
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
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Complete Your Profile
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Please complete your profile to access all features.
              </p>
            </div>
          </div>
        </div>
      )}

      {showVerificationWarning && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 0016 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Identity Verification Required
              </h3>
              <p className="mt-1 text-sm text-red-700">
                You have {dashboardData.days_until_verification_required} days to verify your identity.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HIPAA Notice */}
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium text-blue-900">Protected Health Information</p>
              <p className="text-sm mt-1 text-blue-800">
                All information displayed is protected under HIPAA. Do not share your login credentials or view this information in public spaces.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      {dashboardData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <HealthSummaryCard data={dashboardData.health_summary} />
            <AppointmentCard />
            <MedicationTracker />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <HealthRecordsAccess />
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {dashboardData.quick_actions.map((action) => (
                  <a
                    key={action.id}
                    href={action.href}
                    className={`block p-3 rounded-md border transition-colors ${
                      action.priority === 'high' 
                        ? 'border-red-200 hover:bg-red-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{action.title}</p>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}