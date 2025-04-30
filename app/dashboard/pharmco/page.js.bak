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

export default function PharmcoDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // Simulate fetching pharmco-specific data
    const fetchPharmcoData = async () => {
      try {
        // This would be replaced with actual API calls
        setTimeout(() => {
          setMetrics({
            pendingPrescriptions: 23,
            activeMedications: 156,
            patientAdherence: '78%',
            refillRequests: 12,
            specialtyMedications: 34
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching pharmco data:', error);
        setLoading(false);
      }
    };

    fetchPharmcoData();
  }, []);

  if (loading) {
    return <LoadingComponent />;
  }

  return (
    <DashboardLayout 
      title="Pharmaceutical Dashboard" 
      subtitle={`Welcome back, ${user?.first_name || 'Pharmco Representative'}!`}
      role="pharmco"
    >
      <HIPAABanner />
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <StatsCard 
          title="Pending Prescriptions" 
          value={metrics.pendingPrescriptions} 
          icon="prescription" 
          trend="up"
          linkTo="/prescriptions/pending"
        />
        <StatsCard 
          title="Active Medications" 
          value={metrics.activeMedications} 
          icon="pills" 
          trend="neutral"
          linkTo="/medications/active"
        />
        <StatsCard 
          title="Patient Adherence" 
          value={metrics.patientAdherence} 
          icon="chart-line" 
          trend="up"
          linkTo="/adherence/reports"
        />
        <StatsCard 
          title="Refill Requests" 
          value={metrics.refillRequests} 
          icon="sync" 
          trend="up"
          linkTo="/prescriptions/refills"
        />
        <StatsCard 
          title="Specialty Medications" 
          value={metrics.specialtyMedications} 
          icon="flask" 
          trend="neutral"
          linkTo="/medications/specialty"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Medication Insights</h2>
            <DashboardMetrics 
              metrics={[
                { label: 'Most Prescribed', value: 'Lisinopril 10mg' },
                { label: 'Low Stock Alert', value: '3 medications' },
                { label: 'New Medications', value: '5 this month' },
                { label: 'Discontinued', value: '2 this month' },
                { label: 'Rare Disease Treatments', value: '12 active' }
              ]}
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <DataPanel 
              items={[
                { title: 'New Prescription', description: 'Metformin 500mg for Patient #12345', date: '1 hour ago', type: 'prescription' },
                { title: 'Refill Approved', description: 'Atorvastatin 20mg for Patient #23456', date: '3 hours ago', type: 'refill' },
                { title: 'Medication Alert', description: 'Potential interaction detected', date: '5 hours ago', type: 'alert' },
                { title: 'Inventory Update', description: 'Restocked 5 medications', date: 'Yesterday', type: 'inventory' },
                { title: 'Provider Message', description: 'Question about dosage from Dr. Smith', date: '2 days ago', type: 'message' }
              ]}
            />
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <QuickActionButton 
                label="Process Prescriptions" 
                icon="prescription-bottle-alt" 
                href="/prescriptions/process" 
              />
              <QuickActionButton 
                label="Update Inventory" 
                icon="boxes" 
                href="/inventory/update" 
              />
              <QuickActionButton 
                label="Contact Provider" 
                icon="user-md" 
                href="/messages/providers" 
              />
              <QuickActionButton 
                label="Medication Reports" 
                icon="file-prescription" 
                href="/reports/medications" 
              />
              <QuickActionButton 
                label="Adherence Programs" 
                icon="clipboard-check" 
                href="/programs/adherence" 
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Community</h2>
            <p className="text-gray-600 mb-4">
              Engage with healthcare providers and patients in medication discussions.
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
