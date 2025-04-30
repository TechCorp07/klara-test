"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { healthcare } from '@/lib/services/healthcareService';
import { medicationService } from '@/lib/services/medicationService';
import { telemedicine } from '@/lib/services/telemedicineService';
import { wearablesService } from '@/lib/services/wearablesService';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { 
  DashboardLayout, 
  StatsCard, 
  DataPanel, 
  QuickActionButton 
} from '@/components/dashboard/DashboardComponents';
import { 
  formatDateTime, 
  groupMetricsByType, 
  formatMetricType 
} from '@/utils/helpers';

// SVG icons for quick actions
const CalendarIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const MessageIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const DeviceIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);

const RefillIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const PatientDashboardContent = () => {
  const { user } = useAuth();
  
  // Fetch upcoming appointments
  const { data: appointments } = useQuery({
    queryKey: ['upcomingAppointments'],
    queryFn: () => telemedicine.getUpcomingAppointments(),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load upcoming appointments');
      console.error('Error fetching appointments:', error);
    }
  });
  
  // Fetch medications
  const { data: medications } = useQuery({
    queryKey: ['medications', user?.id],
    queryFn: () => medicationService.getMedications({ patient: user?.id }),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load medications');
      console.error('Error fetching medications:', error);
    }
  });
  
  // Fetch wearable data
  const { data: wearableData } = useQuery({
    queryKey: ['wearableData', user?.id],
    queryFn: () => wearablesService.getWearableData(user?.id, 'all', null, null),
    enabled: !!user,
    onError: (error) => {
      console.error('Error fetching wearable data:', error);
      // Don't show error toast as this might be a normal state (no wearables connected)
    }
  });
  
  // Fetch medical records
  const { data: medicalRecords } = useQuery({
    queryKey: ['medicalRecords', user?.id],
    queryFn: () => healthcare.getMedicalRecords(user?.id),
    enabled: !!user,
    onError: (error) => {
      toast.error('Failed to load medical records');
      console.error('Error fetching medical records:', error);
    }
  });
  
  // Render appointment item
  const renderAppointment = (appointment) => (
    <>
      <p className="font-medium">{formatDateTime(appointment.scheduled_time)}</p>
      <p className="text-sm text-gray-600">{appointment.appointment_type} with Dr. {appointment.provider_name}</p>
    </>
  );
  
  // Render medication item
  const renderMedication = (med) => (
    <>
      <p className="font-medium">{med.name}</p>
      <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
    </>
  );
  
  // Render health metric item
  const renderHealthMetric = (type, metrics) => {
    const latestMetric = metrics[0];
    return (
      <>
        <p className="font-medium">{formatMetricType(type)}</p>
        <p className="text-sm text-gray-600">
          {latestMetric.value} {latestMetric.unit} - {formatDateTime(latestMetric.timestamp)}
        </p>
      </>
    );
  };
  
  // Render medical record item
  const renderMedicalRecord = (record) => (
    <>
      <p className="font-medium">Record #{record.medical_record_number}</p>
      <p className="text-sm text-gray-600">Last updated: {formatDateTime(record.updated_at)}</p>
    </>
  );
  
  // Prepare health metrics data
  const healthMetricsData = wearableData?.results 
    ? Object.entries(groupMetricsByType(wearableData.results)).map(([type, metrics]) => ({
        id: type,
        type,
        metrics
      }))
    : [];
  
  return (
    <>
      {/* Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DataPanel
          title="Upcoming Appointments"
          data={appointments?.results || []}
          renderItem={renderAppointment}
          emptyMessage="No upcoming appointments."
          viewAllLink="/appointments"
          maxItems={3}
        />
        
        <DataPanel
          title="Medications"
          data={medications?.results || []}
          renderItem={renderMedication}
          emptyMessage="No medications prescribed."
          viewAllLink="/medications"
          maxItems={3}
        />
        
        <DataPanel
          title="Health Metrics"
          data={healthMetricsData}
          renderItem={(item) => renderHealthMetric(item.type, item.metrics)}
          emptyMessage="No health metrics available."
          viewAllLink="/health-devices"
          maxItems={3}
        />
      </div>
      
      {/* Medical Records and Care Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <DataPanel
          title="Medical Records"
          data={medicalRecords?.results || []}
          renderItem={renderMedicalRecord}
          emptyMessage="No medical records available."
          viewAllLink="/medical-records"
          maxItems={3}
        />
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Care Plan</h2>
            <Link href="/care-plan" className="text-blue-600 hover:text-blue-800 text-sm">View details</Link>
          </div>
          
          <div className="space-y-4">
            <div className="border-b pb-3">
              <p className="font-medium">Daily Medication</p>
              <p className="text-sm text-gray-600">Take all prescribed medications as scheduled</p>
            </div>
            <div className="border-b pb-3">
              <p className="font-medium">Exercise</p>
              <p className="text-sm text-gray-600">30 minutes of moderate activity, 5 days per week</p>
            </div>
            <div className="border-b pb-3">
              <p className="font-medium">Diet</p>
              <p className="text-sm text-gray-600">Follow recommended nutrition plan</p>
            </div>
          </div>
        </div>
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
            href="/messages/new"
            label="Message Provider"
            icon={<MessageIcon />}
            bgColor="bg-green-100"
            textColor="text-green-800"
            hoverColor="hover:bg-green-200"
          />
          
          <QuickActionButton
            href="/health-devices"
            label="Connect Device"
            icon={<DeviceIcon />}
            bgColor="bg-purple-100"
            textColor="text-purple-800"
            hoverColor="hover:bg-purple-200"
          />
          
          <QuickActionButton
            href="/medications/refill"
            label="Request Refill"
            icon={<RefillIcon />}
            bgColor="bg-yellow-100"
            textColor="text-yellow-800"
            hoverColor="hover:bg-yellow-200"
          />
        </div>
      </div>
      
      {/* Community and Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Community</h2>
            <Link href="/community" className="text-blue-600 hover:text-blue-800 text-sm">Join discussions</Link>
          </div>
          
          <p className="text-gray-600 mb-4">
            Connect with others, share experiences, and learn from the community.
          </p>
          
          <div className="space-y-2">
            <Link href="/community/topics/support" className="block text-blue-600 hover:text-blue-800">
              → Support Groups
            </Link>
            <Link href="/community/topics/questions" className="block text-blue-600 hover:text-blue-800">
              → Questions & Answers
            </Link>
            <Link href="/community/topics/research" className="block text-blue-600 hover:text-blue-800">
              → Research & Studies
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Resources</h2>
            <Link href="/resources" className="text-blue-600 hover:text-blue-800 text-sm">View all</Link>
          </div>
          
          <p className="text-gray-600 mb-4">
            Educational materials and resources to help manage your health.
          </p>
          
          <div className="space-y-2">
            <Link href="/resources/articles" className="block text-blue-600 hover:text-blue-800">
              → Health Articles
            </Link>
            <Link href="/resources/videos" className="block text-blue-600 hover:text-blue-800">
              → Educational Videos
            </Link>
            <Link href="/resources/faq" className="block text-blue-600 hover:text-blue-800">
              → Frequently Asked Questions
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

// Wrap the component with the dashboard HOC
export default function PatientDashboard() {
  return (
    <DashboardLayout title="Patient Dashboard">
      <PatientDashboardContent />
    </DashboardLayout>
  );
}
