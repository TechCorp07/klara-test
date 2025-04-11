"use client";

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { healthcare } from '@/lib/services/healthcareService';
import { telemedicine } from '@/lib/services/telemedicineService';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function CaregiverDashboard() {
  const { user } = useAuth();
  
  // Fetch patients under care
  const { data: patients } = useQuery({
    queryKey: ['caregiverPatients'],
    queryFn: () => healthcare.getCaregiverPatients(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load patients');
      console.error('Error fetching patients:', error);
    }
  });
  
  // Fetch upcoming appointments
  const { data: appointments } = useQuery({
    queryKey: ['caregiverAppointments'],
    queryFn: () => telemedicine.getCaregiverAppointments(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load appointments');
      console.error('Error fetching appointments:', error);
    }
  });
  
  // Fetch medication schedules
  const { data: medications } = useQuery({
    queryKey: ['caregiverMedications'],
    queryFn: () => healthcare.getCaregiverMedications(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load medications');
      console.error('Error fetching medications:', error);
    }
  });
  
  // Fetch care tasks
  const { data: careTasks } = useQuery({
    queryKey: ['caregiverTasks'],
    queryFn: () => healthcare.getCaregiverTasks(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load care tasks');
      console.error('Error fetching care tasks:', error);
    }
  });
  
  // Redirect if user is not a caregiver
  useEffect(() => {
    if (user && user.role !== 'caregiver') {
      window.location.href = '/dashboard';
    }
  }, [user]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Caregiver Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.first_name || 'Caregiver'}!</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Patients Under Care</h2>
          <p className="text-3xl font-bold text-blue-600">
            {patients?.total_count || 0}
          </p>
          <Link href="/caregiver/patients" className="text-blue-600 hover:text-blue-800 text-sm">
            View all →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Upcoming Appointments</h2>
          <p className="text-3xl font-bold text-green-600">
            {appointments?.upcoming_count || 0}
          </p>
          <Link href="/caregiver/appointments" className="text-blue-600 hover:text-blue-800 text-sm">
            View schedule →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Medication Reminders</h2>
          <p className="text-3xl font-bold text-purple-600">
            {medications?.today_count || 0}
          </p>
          <Link href="/caregiver/medications" className="text-blue-600 hover:text-blue-800 text-sm">
            View all →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-medium text-gray-600 mb-2">Pending Tasks</h2>
          <p className="text-3xl font-bold text-yellow-600">
            {careTasks?.pending_count || 0}
          </p>
          <Link href="/caregiver/tasks" className="text-blue-600 hover:text-blue-800 text-sm">
            View tasks →
          </Link>
        </div>
      </div>
      
      {/* Patients and Appointments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Patients Under Care</h2>
            <Link href="/caregiver/patients" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
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
                    <Link href={`/caregiver/patients/${patient.id}`} className="text-sm text-blue-600 hover:text-blue-800">
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No patients under your care.</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
            <Link href="/caregiver/appointments" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
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
                  <p className="text-sm text-gray-600">Patient: {appointment.patient_name}</p>
                  <p className="text-sm text-gray-600">Provider: Dr. {appointment.provider_name} - {appointment.appointment_type}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No upcoming appointments.</p>
          )}
        </div>
      </div>
      
      {/* Medications and Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Medication Schedule</h2>
            <Link href="/caregiver/medications" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
          </div>
          
          {medications && medications.results && medications.results.length > 0 ? (
            <div className="space-y-4">
              {medications.results.slice(0, 5).map((medication) => (
                <div key={medication.id} className="border-b pb-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{medication.name} - {medication.dosage}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      medication.status === 'due' 
                        ? 'bg-red-100 text-red-800' 
                        : medication.status === 'upcoming'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {medication.status.charAt(0).toUpperCase() + medication.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Patient: {medication.patient_name}</p>
                  <p className="text-sm text-gray-600">Time: {medication.scheduled_time} - {medication.frequency}</p>
                  {medication.status === 'due' && (
                    <div className="flex justify-end mt-1">
                      <button className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded">
                        Mark as Given
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No medications scheduled.</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Care Tasks</h2>
            <Link href="/caregiver/tasks" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
          </div>
          
          {careTasks && careTasks.results && careTasks.results.length > 0 ? (
            <div className="space-y-4">
              {careTasks.results.slice(0, 5).map((task) => (
                <div key={task.id} className="border-b pb-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{task.title}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : task.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Patient: {task.patient_name}</p>
                  <p className="text-sm text-gray-600">Due: {task.due_date}</p>
                  <div className="flex justify-end mt-1">
                    <button className="text-sm bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded">
                      Mark Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No pending tasks.</p>
          )}
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/caregiver/tasks/new" className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>Add Task</span>
            </div>
          </Link>
          
          <Link href="/caregiver/appointments/schedule" className="bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Schedule Appointment</span>
            </div>
          </Link>
          
          <Link href="/caregiver/health-log/new" className="bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Log Health Data</span>
            </div>
          </Link>
          
          <Link href="/messages/new" className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-4 rounded-lg text-center">
            <div className="flex flex-col items-center">
              <svg className="h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span>Message Provider</span>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Resources and Support */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Caregiver Resources</h2>
          <Link href="/resources/caregiver" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Care Guides</h3>
            <p className="text-sm text-gray-600 mb-2">
              Access guides for providing care for different conditions.
            </p>
            <Link href="/resources/caregiver/guides" className="text-blue-600 hover:text-blue-800 text-sm">
              View guides →
            </Link>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Support Groups</h3>
            <p className="text-sm text-gray-600 mb-2">
              Connect with other caregivers for support and advice.
            </p>
            <Link href="/community/topics/caregiver-support" className="text-blue-600 hover:text-blue-800 text-sm">
              Join groups →
            </Link>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Self-Care Resources</h3>
            <p className="text-sm text-gray-600 mb-2">
              Resources to help caregivers maintain their own health.
            </p>
            <Link href="/resources/caregiver/self-care" className="text-blue-600 hover:text-blue-800 text-sm">
              View resources →
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
