"use client";

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { telemedicine } from '@/lib/services/telemedicineService';
import { healthcare } from '@/lib/services/healthcareService';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function ProviderDashboard() {
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
  
  // Redirect if user is not a provider
  useEffect(() => {
    if (user && user.role !== 'provider') {
      window.location.href = '/dashboard';
    }
  }, [user]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Provider Dashboard</h1>
        <p className="text-gray-600">Welcome back, Dr. {user?.last_name || 'Provider'}!</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Today's Appointments</h2>
          <p className="text-3xl font-bold text-blue-600">
            {appointments?.today_count || 0}
          </p>
          <Link href="/appointments" className="text-blue-600 hover:text-blue-800 text-sm">
            View schedule →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Unread Messages</h2>
          <p className="text-3xl font-bold text-blue-600">
            {messages?.unread_count || 0}
          </p>
          <Link href="/messages" className="text-blue-600 hover:text-blue-800 text-sm">
            View messages →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Pending Referrals</h2>
          <p className="text-3xl font-bold text-blue-600">
            {referrals?.pending_count || 0}
          </p>
          <Link href="/referrals" className="text-blue-600 hover:text-blue-800 text-sm">
            View referrals →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Total Patients</h2>
          <p className="text-3xl font-bold text-blue-600">
            {patients?.total_count || 0}
          </p>
          <Link href="/patients" className="text-blue-600 hover:text-blue-800 text-sm">
            View patients →
          </Link>
        </div>
      </div>
      
      {/* Appointments and Messages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
            <Link href="/appointments" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
          </div>
          
          {appointments && appointments.results && appointments.results.length > 0 ? (
            <div className="space-y-4">
              {appointments.results.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="border-b pb-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{new Date(appointment.scheduled_time).toLocaleDateString()} at {new Date(appointment.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'scheduled' 
                        ? 'bg-green-100 text-green-800' 
                        : appointment.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{appointment.patient_name} - {appointment.appointment_type}</p>
                  <p className="text-sm text-gray-600">{appointment.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No upcoming appointments.</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Messages</h2>
            <Link href="/messages" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
          </div>
          
          {messages && messages.results && messages.results.length > 0 ? (
            <div className="space-y-4">
              {messages.results.slice(0, 5).map((message) => (
                <div key={message.id} className="border-b pb-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{message.sender_name}</p>
                    <span className="text-xs text-gray-500">{new Date(message.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{message.content}</p>
                  <Link href={`/messages/${message.conversation_id}`} className="text-sm text-blue-600 hover:text-blue-800">
                    Reply →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No unread messages.</p>
          )}
        </div>
      </div>
      
      {/* Patients and Referrals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Patients</h2>
            <Link href="/patients" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
          </div>
          
          {patients && patients.results && patients.results.length > 0 ? (
            <div className="space-y-4">
              {patients.results.slice(0, 5).map((patient) => (
                <div key={patient.id} className="border-b pb-3">
                  <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-600">
                      {patient.gender}, {calculateAge(patient.date_of_birth)} years
                    </p>
                    <Link href={`/patients/${patient.id}`} className="text-sm text-blue-600 hover:text-blue-800">
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No patients found.</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Pending Referrals</h2>
            <Link href="/referrals" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
          </div>
          
          {referrals && referrals.results && referrals.results.length > 0 ? (
            <div className="space-y-4">
              {referrals.results.slice(0, 5).map((referral) => (
                <div key={referral.id} className="border-b pb-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{referral.patient_name}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      referral.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : referral.status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">To: {referral.referred_to_name}</p>
                  <p className="text-sm text-gray-600">Reason: {referral.reason}</p>
                  <div className="flex justify-end mt-1">
                    <Link href={`/referrals/${referral.id}`} className="text-sm text-blue-600 hover:text-blue-800">
                      Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No pending referrals.</p>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/appointments/new" className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Schedule Appointment</span>
            </div>
          </Link>
          
          <Link href="/patients/new" className="bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Add New Patient</span>
            </div>
          </Link>
          
          <Link href="/referrals/new" className="bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <span>Create Referral</span>
            </div>
          </Link>
          
          <Link href="/telemedicine/start" className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Start Telemedicine</span>
            </div>
          </Link>
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
    </div>
  );
}

// Helper function to calculate age from date of birth
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}
