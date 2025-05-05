"use client";

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { medicationService } from '@/lib/services/medicationService';
import Link from 'next/link';
import { toast } from 'react-toastify';

// Dashboard Components
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

  // Redirect if user is not a pharmco
  useEffect(() => {
    if (user && user.role !== 'pharmco') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  // Fetch medication inventory
  const { data: inventory } = useQuery({
    queryKey: ['medicationInventory'],
    queryFn: () => medicationService.getMedicationInventory(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load medication inventory');
      console.error('Error fetching inventory:', error);
    }
  });
  
  // Fetch pending prescriptions
  const { data: prescriptions } = useQuery({
    queryKey: ['pendingPrescriptions'],
    queryFn: () => medicationService.getPrescriptions({ status: 'pending' }),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load prescriptions');
      console.error('Error fetching prescriptions:', error);
    }
  });
  
  // Fetch medication adherence data
  const { data: adherenceData } = useQuery({
    queryKey: ['medicationAdherence'],
    queryFn: () => medicationService.getMedicationAdherenceStats(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load adherence data');
      console.error('Error fetching adherence data:', error);
    }
  });
  
  // Fetch medication interactions
  const { data: interactions } = useQuery({
    queryKey: ['medicationInteractions'],
    queryFn: () => medicationService.getMedicationInteractions(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load medication interactions');
      console.error('Error fetching interactions:', error);
    }
  });

  useEffect(() => {
    // Set loading to false once all queries are settled
    if (inventory && prescriptions && adherenceData && interactions) {
      setLoading(false);
    }
  }, [inventory, prescriptions, adherenceData, interactions]);

  if (loading) {
    return <LoadingComponent />;
  }

  // Calculate metrics from data
  const metrics = {
    pendingPrescriptions: prescriptions?.pending_count || 0,
    activeMedications: inventory?.active_count || 0,
    patientAdherence: `${adherenceData?.average_adherence_rate || 0}%`,
    refillRequests: prescriptions?.refill_count || 0,
    specialtyMedications: inventory?.specialty_count || 0,
    lowStockCount: inventory?.low_stock_count || 0,
    interactionsCount: interactions?.total_count || 0
  };

  // Get most prescribed medication
  const mostPrescribed = inventory?.most_prescribed || 'Lisinopril 10mg';

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
          {/* Medication Insights Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Medication Insights</h2>
            <DashboardMetrics 
              metrics={[
                { label: 'Most Prescribed', value: mostPrescribed },
                { label: 'Low Stock Alert', value: `${metrics.lowStockCount} medications` },
                { label: 'New Medications', value: inventory?.new_count || '5 this month' },
                { label: 'Medication Interactions', value: `${metrics.interactionsCount} detected` },
                { label: 'Rare Disease Treatments', value: inventory?.rare_disease_count || '12 active' }
              ]}
            />
          </div>
          
          {/* Prescription Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Pending Prescriptions</h2>
              <Link href="/prescriptions" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
            </div>
            
            {prescriptions && prescriptions.results && prescriptions.results.length > 0 ? (
              <div className="space-y-4">
                {prescriptions.results.slice(0, 5).map((prescription) => (
                  <div key={prescription.id} className="border-b pb-3">
                    <div className="flex justify-between">
                      <p className="font-medium">{prescription.patient_name}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        prescription.priority === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : prescription.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {prescription.priority.charAt(0).toUpperCase() + prescription.priority.slice(1)} Priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{prescription.medication_name} - {prescription.dosage}</p>
                    <p className="text-sm text-gray-600">Prescribed by: Dr. {prescription.prescriber_name}</p>
                    <div className="flex justify-end mt-1 space-x-2">
                      <button className="text-sm bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded">
                        Approve
                      </button>
                      <button className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <DataPanel 
                items={[
                  { title: 'New Prescription', description: 'Metformin 500mg for Patient #12345', date: '1 hour ago', type: 'prescription' },
                  { title: 'Refill Approved', description: 'Atorvastatin 20mg for Patient #23456', date: '3 hours ago', type: 'refill' },
                  { title: 'Medication Alert', description: 'Potential interaction detected', date: '5 hours ago', type: 'alert' },
                  { title: 'Inventory Update', description: 'Restocked 5 medications', date: 'Yesterday', type: 'inventory' },
                  { title: 'Provider Message', description: 'Question about dosage from Dr. Smith', date: '2 days ago', type: 'message' }
                ]}
              />
            )}
          </div>
          
          {/* Medication Interactions Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Medication Interactions</h2>
              <Link href="/interactions" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
            </div>
            
            {interactions && interactions.results && interactions.results.length > 0 ? (
              <div className="space-y-4">
                {interactions.results.slice(0, 5).map((interaction) => (
                  <div key={interaction.id} className="border-b pb-3">
                    <div className="flex justify-between">
                      <p className="font-medium">{interaction.patient_name}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        interaction.severity === 'high' 
                          ? 'bg-red-100 text-red-800' 
                          : interaction.severity === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {interaction.severity.charAt(0).toUpperCase() + interaction.severity.slice(1)} Severity
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Interaction:</span> {interaction.medication_1} + {interaction.medication_2}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Effect:</span> {interaction.effect}
                    </p>
                    <div className="flex justify-end mt-1">
                      <button className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded">
                        Notify Provider
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No medication interactions detected.</p>
            )}
          </div>
        </div>
        
        <div>
          {/* Quick Actions */}
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
                label="Medication Review" 
                icon="clipboard-check" 
                href="/patients/medication-review" 
              />
              <QuickActionButton 
                label="Contact Provider" 
                icon="user-md" 
                href="/messages/providers" 
              />
              <QuickActionButton 
                label="Generate Reports" 
                icon="file-prescription" 
                href="/reports/medications" 
              />
            </div>
          </div>
          
          {/* Low Stock Inventory */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Low Stock Inventory</h2>
              <Link href="/inventory" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
            </div>
            
            {inventory && inventory.results && inventory.results.length > 0 ? (
              <div className="space-y-4">
                {inventory.results
                  .filter(item => item.stock_level === 'low' || item.stock_level === 'critical')
                  .slice(0, 5)
                  .map((item) => (
                    <div key={item.id} className="border-b pb-3">
                      <div className="flex justify-between">
                        <p className="font-medium">{item.medication_name}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.stock_level === 'critical' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.stock_level.charAt(0).toUpperCase() + item.stock_level.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{item.current_quantity} units remaining</p>
                      <div className="flex justify-end mt-1">
                        <button className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded">
                          Reorder
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500">No low stock items.</p>
            )}
          </div>
          
          {/* Community Panel */}
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