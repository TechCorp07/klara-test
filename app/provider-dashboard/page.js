"use client";

export const dynamic = "force-dynamic";
import Link from 'next/link';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { telemedicine } from '@/lib/services/telemedicineService';
import { healthcare } from '@/lib/services/healthcareService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { 
  DashboardLayout, 
  StatsCard, 
  DataPanel, 
  QuickActionButton 
} from '@/components/dashboard/DashboardComponents';
import { 
  formatDateTime, 
  calculateAge,
  getStatusColorClasses,
  capitalizeFirstLetter
} from '@/utils/helpers';

// SVG icons for quick actions
const CalendarIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const PatientIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const ReferralIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
  </svg>
);

const TelemedicineIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const ProviderDashboardContent = () => {
  const { user } = useAuth();
  
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
    <>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Today's Appointments"
          value={appointments?.today_count || 0}
          linkText="View schedule"
          linkHref="/appointments"
          valueColor="text-blue-600"
        />
        
        <StatsCard
          title="Unread Messages"
          value={messages?.unread_count || 0}
          linkText="View messages"
          linkHref="/messages"
          valueColor="text-blue-600"
        />
        
        <StatsCard
          title="Pending Referrals"
          value={referrals?.pending_count || 0}
          linkText="View referrals"
          linkHref="/referrals"
          valueColor="text-blue-600"
        />
        
        <StatsCard
          title="Total Patients"
          value={patients?.total_count || 0}
          linkText="View patients"
          linkHref="/patients"
          valueColor="text-blue-600"
        />
      </div>
      
      {/* Appointments and Messages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <DataPanel
          title="Upcoming Appointments"
          data={appointments?.results || []}
          renderItem={renderAppointment}
          emptyMessage="No upcoming appointments."
          viewAllLink="/appointments"
          maxItems={5}
        />
        
        <DataPanel
          title="Recent Messages"
          data={messages?.results || []}
          renderItem={renderMessage}
          emptyMessage="No unread messages."
          viewAllLink="/messages"
          maxItems={5}
        />
      </div>
      
      {/* Patients and Referrals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <DataPanel
          title="Recent Patients"
          data={patients?.results || []}
          renderItem={renderPatient}
          emptyMessage="No patients found."
          viewAllLink="/patients"
          maxItems={5}
        />
        
        <DataPanel
          title="Pending Referrals"
          data={referrals?.results || []}
          renderItem={renderReferral}
          emptyMessage="No pending referrals."
          viewAllLink="/referrals"
          maxItems={5}
        />
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton
            href="/appointments/new"
            label="Schedule Appointment"
            icon={<CalendarIcon />}
            bgColor="bg-blue-100"
            textColor="text-blue-800"
            hoverColor="hover:bg-blue-200"
          />
          
          <QuickActionButton
            href="/patients/new"
            label="Add New Patient"
            icon={<PatientIcon />}
            bgColor="bg-green-100"
            textColor="text-green-800"
            hoverColor="hover:bg-green-200"
          />
          
          <QuickActionButton
            href="/referrals/new"
            label="Create Referral"
            icon={<ReferralIcon />}
            bgColor="bg-purple-100"
            textColor="text-purple-800"
            hoverColor="hover:bg-purple-200"
          />
          
          <QuickActionButton
            href="/telemedicine/start"
            label="Start Telemedicine"
            icon={<TelemedicineIcon />}
            bgColor="bg-yellow-100"
            textColor="text-yellow-800"
            hoverColor="hover:bg-yellow-200"
          />
        </div>
      </div>
      
      {/* Clinical Resources */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Clinical Resources</h2>
          <Link href="/resources" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Rare Condition Registry</h3>
            <p className="text-sm text-gray-600 mb-2">
              Access the rare condition database and registry.
            </p>
            <Link href="/resources/rare-conditions" className="text-blue-600 hover:text-blue-800 text-sm">
              Explore registry →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

// Wrap the component with the dashboard HOC
export default function ProviderDashboard() {
  return (
    <DashboardLayout title="Provider Dashboard">
      <ProviderDashboardContent />
    </DashboardLayout>
  );
}
