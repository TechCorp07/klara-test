"use client";

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { medication } from '@/lib/services/medicationService';
import { healthcare } from '@/lib/services/healthcareService';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function PharmcoDashboard() {
  const { user } = useAuth();
  
  // Fetch medication inventory
  const { data: inventory } = useQuery({
    queryKey: ['medicationInventory'],
    queryFn: () => medication.getMedicationInventory(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load medication inventory');
      console.error('Error fetching inventory:', error);
    }
  });
  
  // Fetch pending prescriptions
  const { data: prescriptions } = useQuery({
    queryKey: ['pendingPrescriptions'],
    queryFn: () => medication.getPrescriptions({ status: 'pending' }),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load prescriptions');
      console.error('Error fetching prescriptions:', error);
    }
  });
  
  // Fetch medication adherence data
  const { data: adherenceData } = useQuery({
    queryKey: ['medicationAdherence'],
    queryFn: () => medication.getMedicationAdherenceStats(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load adherence data');
      console.error('Error fetching adherence data:', error);
    }
  });
  
  // Fetch medication interactions
  const { data: interactions } = useQuery({
    queryKey: ['medicationInteractions'],
    queryFn: () => medication.getMedicationInteractions(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load medication interactions');
      console.error('Error fetching interactions:', error);
    }
  });
  
  // Redirect if user is not a pharmco
  useEffect(() => {
    if (user && user.role !== 'pharmco') {
      window.location.href = '/dashboard';
    }
  }, [user]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Pharmacy Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.first_name || 'Pharmacist'}!</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Pending Prescriptions</h2>
          <p className="text-3xl font-bold text-blue-600">
            {prescriptions?.pending_count || 0}
          </p>
          <Link href="/prescriptions" className="text-blue-600 hover:text-blue-800 text-sm">
            View all →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Low Stock Items</h2>
          <p className="text-3xl font-bold text-yellow-600">
            {inventory?.low_stock_count || 0}
          </p>
          <Link href="/inventory" className="text-blue-600 hover:text-blue-800 text-sm">
            View inventory →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Medication Interactions</h2>
          <p className="text-3xl font-bold text-red-600">
            {interactions?.total_count || 0}
          </p>
          <Link href="/interactions" className="text-blue-600 hover:text-blue-800 text-sm">
            View details →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Avg. Adherence Rate</h2>
          <p className="text-3xl font-bold text-green-600">
            {adherenceData?.average_adherence_rate || 0}%
          </p>
          <Link href="/adherence" className="text-blue-600 hover:text-blue-800 text-sm">
            View details →
          </Link>
        </div>
      </div>
      
      {/* Prescriptions and Inventory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
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
            <p className="text-gray-500">No pending prescriptions.</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
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
      </div>
      
      {/* Medication Interactions and Adherence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Medication Adherence</h2>
            <Link href="/adherence" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
          </div>
          
          {adherenceData && adherenceData.patients && adherenceData.patients.length > 0 ? (
            <div className="space-y-4">
              {adherenceData.patients.slice(0, 5).map((patient, index) => (
                <div key={index} className="border-b pb-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{patient.name}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      patient.adherence_rate < 50 
                        ? 'bg-red-100 text-red-800' 
                        : patient.adherence_rate < 80
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {patient.adherence_rate}% Adherence
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Medications:</span> {patient.medication_count}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Last Refill:</span> {patient.last_refill_date}
                  </p>
                  <div className="flex justify-end mt-1">
                    <button className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded">
                      Send Reminder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No adherence data available.</p>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/prescriptions/new" className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Create Prescription</span>
            </div>
          </Link>
          
          <Link href="/inventory/update" className="bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <span>Update Inventory</span>
            </div>
          </Link>
          
          <Link href="/patients/medication-review" className="bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>Medication Review</span>
            </div>
          </Link>
          
          <Link href="/reports/medication" className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Generate Reports</span>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Pharmacy Resources */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Pharmacy Resources</h2>
          <Link href="/resources" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Drug Information</h3>
            <p className="text-sm text-gray-600 mb-2">
              Access comprehensive drug information and references.
            </p>
            <Link href="/resources/drug-information" className="text-blue-600 hover:text-blue-800 text-sm">
              View database →
            </Link>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Clinical Guidelines</h3>
            <p className="text-sm text-gray-600 mb-2">
              View updated clinical guidelines and protocols.
            </p>
            <Link href="/resources/clinical-guidelines" className="text-blue-600 hover:text-blue-800 text-sm">
              View guidelines →
            </Link>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Continuing Education</h3>
            <p className="text-sm text-gray-600 mb-2">
              Access continuing education resources and courses.
            </p>
            <Link href="/resources/education" className="text-blue-600 hover:text-blue-800 text-sm">
              View courses →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
