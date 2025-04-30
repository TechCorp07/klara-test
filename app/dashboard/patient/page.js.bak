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

export default function PatientDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // Simulate fetching patient-specific data
    const fetchPatientData = async () => {
      try {
        // This would be replaced with actual API calls
        setTimeout(() => {
          setMetrics({
            upcomingAppointments: 2,
            medicationAdherence: 85,
            lastCheckup: '2023-03-15',
            activeConditions: 3,
            recentMessages: 5
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching patient data:', error);
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <DashboardLayout 
      title="Patient Dashboard" 
      subtitle={`Welcome back, ${user?.first_name || 'Patient'}!`}
      role="patient"
    >
      <HIPAABanner />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard 
          title="Upcoming Appointments" 
          value={metrics.upcomingAppointments} 
          icon="calendar" 
          trend="neutral"
          linkTo="/appointments"
        />
        <StatsCard 
          title="Medication Adherence" 
          value={`${metrics.medicationAdherence}%`} 
          icon="pill" 
          trend={metrics.medicationAdherence > 80 ? "up" : "down"}
          linkTo="/medications"
        />
        <StatsCard 
          title="Active Conditions" 
          value={metrics.activeConditions} 
          icon="heartbeat" 
          trend="neutral"
          linkTo="/conditions"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Health Overview</h2>
            <DashboardMetrics 
              metrics={[
                { label: 'Last Checkup', value: new Date(metrics.lastCheckup).toLocaleDateString() },
                { label: 'Unread Messages', value: metrics.recentMessages },
                { label: 'Medication Refills Needed', value: '2' }
              ]}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <DataPanel 
              items={[
                { title: 'Prescription Refilled', description: 'Lisinopril 10mg', date: '2023-04-01', type: 'medication' },
                { title: 'Lab Results Available', description: 'Complete Blood Count', date: '2023-03-28', type: 'lab' },
                { title: 'Appointment Completed', description: 'Dr. Smith - Follow-up', date: '2023-03-15', type: 'appointment' }
              ]}
            />
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <QuickActionButton 
                label="Schedule Appointment" 
                icon="calendar-plus" 
                href="/appointments/schedule" 
              />
              <QuickActionButton 
                label="Message Provider" 
                icon="comment-medical" 
                href="/messages/new" 
              />
              <QuickActionButton 
                label="Request Refill" 
                icon="prescription-bottle-alt" 
                href="/medications/refill" 
              />
              <QuickActionButton 
                label="View Medical Records" 
                icon="file-medical" 
                href="/medical-records" 
              />
              <QuickActionButton 
                label="Update Health Profile" 
                icon="user-edit" 
                href="/profile" 
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Community</h2>
            <p className="text-gray-600 mb-4">
              Connect with others who share similar health experiences.
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
