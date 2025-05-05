"use client";

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { telemedicine } from '@/lib/services/telemedicineService';
import { healthcare } from '@/lib/services/healthcareService';

// Dashboard Components
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import QuickActionButton from '@/components/dashboard/QuickActionButton';
import DataPanel from '@/components/dashboard/DataPanel';
import HIPAABanner from '@/components/ui/HIPAABanner';
import LoadingComponent from '@/components/ui/LoadingComponent';

// Helpers
import { 
  formatDateTime, 
  calculateAge,
  getStatusColorClasses,
  capitalizeFirstLetter
} from '@/utils/helpers';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Redirect if user is not a provider
  useEffect(() => {
    if (user && user.role !== 'provider') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  // Fetch upcoming appointments
  const { data: appointments } = useQuery({
    queryKey: ['providerAppointments'],
    queryFn: () => telemedicine.getProviderAppointments(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load appointments');
      console.error('Error fetching appointments:', error);
    }
  });
  
  // Fetch patients
  const { data: patients } = useQuery({
    queryKey: ['providerPatients'],
    queryFn: () => healthcare.getProviderPatients(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load patients');
      console.error('Error fetching patients:', error);
    }
  });
  
  // Fetch pending messages
  const { data: messages } = useQuery({
    queryKey: ['providerMessages'],
    queryFn: () => telemedicine.getProviderMessages({ status: 'unread' }),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load messages');
      console.error('Error fetching messages:', error);
    }
  });
  
  // Fetch referrals
  const { data: referrals } = useQuery({
    queryKey: ['providerReferrals'],
    queryFn: () => healthcare.getProviderReferrals(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load referrals');
      console.error('Error fetching referrals:', error);
    }
  });

  useEffect(() => {
    // Set loading to false once all queries are settled
    if (appointments && patients && messages && referrals) {
      setLoading(false);
    }
  }, [appointments, patients, messages, referrals]);

  if (loading) {
    return <LoadingComponent />;
  }

  // Calculate metrics from data
  const metrics = {
    todayAppointments: appointments?.today_count || 0,
    pendingMessages: messages?.unread_count || 0,
    patientCount: patients?.total_count || 0,
    pendingRefills: appointments?.refill_count || 0,
    pendingReferrals: referrals?.pending_count || 0
  };

  // Render appointment item
  const renderAppointment = (appointment) => (
    <>
      <div className="flex justify-between">
        <p className="font-medium">{formatDateTime(appointment.scheduled_time)}</p>
        <span className={`px-2 py-1 text-xs rounded-full ${
          getStatusColorClasses(appointment.status)
        }`}>
          {capitalizeFirstLetter(appointment.status)}
        </span>
      </div>
      <p className="text-sm text-gray-600">{appointment.patient_name} - {appointment.appointment_type}</p>
      <p className="text-sm text-gray-600">{appointment.reason}</p>
    </>
  );
  
  // Render message item
  const renderMessage = (message) => (
    <>
      <div className="flex justify-between">
        <p className="font-medium">{message.sender_name}</p>
        <span className="text-xs text-gray-500">{formatDateTime(message.created_at)}</span>
      </div>
      <p className="text-sm text-gray-600 truncate">{message.content}</p>
      <Link href={`/messages/${message.conversation_id}`} className="text-sm text-blue-600 hover:text-blue-800">
        Reply →
      </Link>
    </>
  );
  
  // Render patient item
  const renderPatient = (patient) => (
    <>
      <p className="font-medium">{patient.first_name} {patient.last_name}</p>
      <div className="flex justify-between">
        <p className="text-sm text-gray-600">
          {patient.gender}, {calculateAge(patient.date_of_birth)} years
        </p>
        <Link href={`/patients/${patient.id}`} className="text-sm text-blue-600 hover:text-blue-800">
          View →
        </Link>
      </div>
    </>
  );
  
  // Render referral item
  const renderReferral = (referral) => (
    <>
      <div className="flex justify-between">
        <p className="font-medium">{referral.patient_name}</p>
        <span className={`px-2 py-1 text-xs rounded-full ${
          getStatusColorClasses(referral.status)
        }`}>
          {capitalizeFirstLetter(referral.status)}
        </span>
      </div>
      <p className="text-sm text-gray-600">To: {referral.referred_to_name}</p>
      <p className="text-sm text-gray-600">Reason: {referral.reason}</p>
      <div className="flex justify-end mt-1">
        <Link href={`/referrals/${referral.id}`} className="text-sm text-blue-600 hover:text-blue-800">
          Details →
        </Link>
      </div>
    </>
  );

  return (
    <DashboardLayout 
      title="Provider Dashboard" 
      subtitle={`Welcome back, Dr. ${user?.last_name || 'Provider'}!`}
      role="provider"
    >
      <HIPAABanner />
      
      {/* Stats Overview */}
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
          {/* Appointments Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Today's Schedule</h2>
              <Link href="/appointments" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
            </div>
            
            {appointments && appointments.results && appointments.results.length > 0 ? (
              <div className="space-y-4">
                {appointments.results.slice(0, 5).map((appointment, index) => (
                  <div key={appointment.id || index} className="border-b pb-3">
                    {renderAppointment(appointment)}
                  </div>
                ))}
              </div>
            ) : (
              <DataPanel 
                items={[
                  { title: 'John Smith', description: 'Follow-up - Hypertension', date: '09:00 AM', type: 'appointment' },
                  { title: 'Mary Johnson', description: 'New Patient - Initial Consultation', date: '10:30 AM', type: 'appointment' },
                  { title: 'Robert Davis', description: 'Lab Results Review', date: '01:15 PM', type: 'appointment' },
                  { title: 'Sarah Williams', description: 'Medication Review', date: '02:45 PM', type: 'appointment' },
                  { title: 'Michael Brown', description: 'Annual Physical', date: '04:00 PM', type: 'appointment' }
                ]}
              />
            )}
          </div>
          
          {/* Messages Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Messages</h2>
              <Link href="/messages" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
            </div>
            
            {messages && messages.results && messages.results.length > 0 ? (
              <div className="space-y-4">
                {messages.results.slice(0, 5).map((message, index) => (
                  <div key={message.id || index} className="border-b pb-3">
                    {renderMessage(message)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No unread messages.</p>
            )}
          </div>
          
          {/* Patients Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Patients</h2>
              <Link href="/patients" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
            </div>
            
            {patients && patients.results && patients.results.length > 0 ? (
              <div className="space-y-4">
                {patients.results.slice(0, 5).map((patient, index) => (
                  <div key={patient.id || index} className="border-b pb-3">
                    {renderPatient(patient)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent patients.</p>
            )}
          </div>
        </div>
        
        <div>
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <QuickActionButton 
                label="Start Telemedicine Session" 
                icon="video" 
                href="/telemedicine/start" 
              />
              <QuickActionButton 
                label="Schedule Appointment" 
                icon="calendar-plus" 
                href="/appointments/new" 
              />
              <QuickActionButton 
                label="Add New Patient" 
                icon="user-plus" 
                href="/patients/new" 
              />
              <QuickActionButton 
                label="Approve Medication Refills" 
                icon="prescription-bottle" 
                href="/medications/refills" 
              />
              <QuickActionButton 
                label="Create Referral" 
                icon="share" 
                href="/referrals/new" 
              />
            </div>
          </div>
          
          {/* Referrals Panel */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Pending Referrals</h2>
              <Link href="/referrals" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
            </div>
            
            {referrals && referrals.results && referrals.results.length > 0 ? (
              <div className="space-y-4">
                {referrals.results.filter(r => r.status === 'pending').slice(0, 5).map((referral, index) => (
                  <div key={referral.id || index} className="border-b pb-3">
                    {renderReferral(referral)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No pending referrals.</p>
            )}
          </div>
          
          {/* Community Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Clinical Resources</h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Latest Research</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Access the latest clinical research and studies.
                </p>
                <Link href="/resources/research" className="text-blue-600 hover:text-blue-800 text-sm">
                  Browse research →
                </Link>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Treatment Guidelines</h3>
                <p className="text-sm text-gray-600 mb-2">
                  View updated treatment protocols and guidelines.
                </p>
                <Link href="/resources/guidelines" className="text-blue-600 hover:text-blue-800 text-sm">
                  View guidelines →
                </Link>
              </div>
            </div>
            
            {user?.data_sharing_consent ? (
              <div className="mt-4">
                <Link
                  href="/community" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                  Join Healthcare Community
                </Link>
              </div>
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
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