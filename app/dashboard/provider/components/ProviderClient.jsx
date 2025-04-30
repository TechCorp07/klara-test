"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import QuickActionButton from '@/components/dashboard/QuickActionButton';
import DataPanel from '@/components/dashboard/DataPanel';
import HIPAABanner from '@/components/ui/HIPAABanner';
import LoadingComponent from '@/components/ui/LoadingComponent';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // Simulate fetching provider-specific data
    const fetchProviderData = async () => {
      try {
        // This would be replaced with actual API calls
        setTimeout(() => {
          setMetrics({
            todayAppointments: 8,
            pendingMessages: 12,
            patientCount: 156,
            pendingRefills: 7,
            recentReferrals: 3
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching provider data:', error);
        setLoading(false);
      }
    };

    fetchProviderData();
  }, []);

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <DashboardLayout 
      title="Provider Dashboard" 
      subtitle={`Welcome back, Dr. ${user?.last_name || 'Provider'}!`}
      role="provider"
    >
      <HIPAABanner />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatsCard 
          title="Today's Appointments" 
          value={metrics.todayAppointments} 
          icon="calendar" 
          trend="neutral"
          linkTo="/appointments"
        />
        <StatsCard 
          title="Pending Messages" 
          value={metrics.pendingMessages} 
          icon="envelope" 
          trend="up"
          linkTo="/messages"
        />
        <StatsCard 
          title="Patient Count" 
          value={metrics.patientCount} 
          icon="users" 
          trend="up"
          linkTo="/patients"
        />
        <StatsCard 
          title="Pending Refills" 
          value={metrics.pendingRefills} 
          icon="prescription" 
          trend="neutral"
          linkTo="/medications/refills"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
            <DataPanel 
              items={[
                { title: 'John Smith', description: 'Follow-up - Hypertension', date: '09:00 AM', type: 'appointment' },
                { title: 'Mary Johnson', description: 'New Patient - Initial Consultation', date: '10:30 AM', type: 'appointment' },
                { title: 'Robert Davis', description: 'Lab Results Review', date: '01:15 PM', type: 'appointment' },
                { title: 'Sarah Williams', description: 'Medication Review', date: '02:45 PM', type: 'appointment' },
                { title: 'Michael Brown', description: 'Annual Physical', date: '04:00 PM', type: 'appointment' }
              ]}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Patient Activity</h2>
            <DataPanel 
              items={[
                { title: 'Lab Results', description: 'New results for Emily Wilson', date: '1 hour ago', type: 'lab' },
                { title: 'Medication Request', description: 'Refill request from James Taylor', date: '3 hours ago', type: 'medication' },
                { title: 'Message', description: 'Question from Patricia Moore', date: '5 hours ago', type: 'message' },
                { title: 'Appointment', description: 'New booking from Thomas Anderson', date: 'Yesterday', type: 'appointment' }
              ]}
            />
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <QuickActionButton 
                label="Start Telemedicine Session" 
                icon="video" 
                href="/telemedicine/start" 
              />
              <QuickActionButton 
                label="Review Lab Results" 
                icon="flask" 
                href="/lab-results" 
              />
              <QuickActionButton 
                label="Approve Medication Refills" 
                icon="prescription-bottle" 
                href="/medications/refills" 
              />
              <QuickActionButton 
                label="Send Patient Message" 
                icon="paper-plane" 
                href="/messages/new" 
              />
              <QuickActionButton 
                label="Update Availability" 
                icon="clock" 
                href="/schedule/availability" 
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Community</h2>
            <p className="text-gray-600 mb-4">
              Engage with patients and other providers in the healthcare community.
            </p>
            {user?.data_sharing_consent ? (
              <a 
                href="/community" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                Join Discussions
              </a>
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      You need to provide consent to access community features.
                      <a href="/profile/consent" className="font-medium underline text-yellow-700 hover:text-yellow-600"> Update settings</a>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
